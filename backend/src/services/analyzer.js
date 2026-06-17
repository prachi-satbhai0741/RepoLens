import {
  fetchRepoInfo,
  fetchLanguages,
  fetchRepoTree,
  fetchFileContent,
  fetchRecentCommits,
} from './github.js';

/* ---------- helpers ---------- */

const EXT_TO_TECH = {
  '.js': 'JavaScript', '.jsx': 'React', '.ts': 'TypeScript', '.tsx': 'React',
  '.py': 'Python', '.go': 'Go', '.rs': 'Rust', '.java': 'Java',
  '.rb': 'Ruby', '.php': 'PHP', '.swift': 'Swift', '.kt': 'Kotlin',
  '.c': 'C', '.cpp': 'C++', '.cs': 'C#', '.vue': 'Vue',
  '.svelte': 'Svelte', '.dart': 'Dart', '.sql': 'SQL',
};

const CONFIG_TECH = {
  'Dockerfile': 'Docker', 'docker-compose.yml': 'Docker',
  'docker-compose.yaml': 'Docker', '.dockerignore': 'Docker',
  'Jenkinsfile': 'Jenkins', '.travis.yml': 'Travis CI',
  '.github/workflows': 'GitHub Actions',
  'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
  'terraform': 'Terraform', '.tf': 'Terraform',
  'next.config': 'Next.js', 'nuxt.config': 'Nuxt.js',
  'vite.config': 'Vite', 'webpack.config': 'Webpack',
  'tailwind.config': 'Tailwind CSS', 'tsconfig.json': 'TypeScript',
  '.eslintrc': 'ESLint', '.prettierrc': 'Prettier',
  'jest.config': 'Jest', 'vitest.config': 'Vitest',
  'requirements.txt': 'Python', 'setup.py': 'Python',
  'Cargo.toml': 'Rust', 'go.mod': 'Go', 'Gemfile': 'Ruby',
  'pom.xml': 'Maven', 'build.gradle': 'Gradle',
};

const SECURITY_PATTERNS = [
  { pattern: /(?:password|secret|api_key|apikey|token)\s*[:=]\s*['"][^'"]{3,}['"]/gi, title: 'Possible hardcoded secret', severity: 'high' },
  { pattern: /eval\s*\(/g, title: 'Use of eval()', severity: 'high' },
  { pattern: /innerHTML\s*=/g, title: 'Direct innerHTML assignment (XSS risk)', severity: 'medium' },
  { pattern: /document\.write\s*\(/g, title: 'Use of document.write()', severity: 'medium' },
  { pattern: /exec\s*\(\s*['"`].*\$\{/g, title: 'Potential command injection', severity: 'high' },
  { pattern: /SELECT\s+.*\+\s*(req|user|input)/gi, title: 'Potential SQL injection', severity: 'high' },
  { pattern: /console\.(log|debug|info)\s*\(/g, title: 'Console statement left in code', severity: 'low' },
  { pattern: /TODO|FIXME|HACK|XXX/g, title: 'TODO/FIXME comment found', severity: 'info' },
  { pattern: /cors\(\s*\)/g, title: 'CORS enabled with no restrictions', severity: 'medium' },
  { pattern: /disable.*ssl|verify\s*=\s*false|rejectUnauthorized\s*:\s*false/gi, title: 'SSL verification disabled', severity: 'high' },
];

const DOC_FILES = ['README.md', 'readme.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'docs/', 'LICENSE', 'license'];
const CI_FILES = ['.github/workflows/', '.travis.yml', 'Jenkinsfile', '.circleci/', '.gitlab-ci.yml'];
const TEST_PATTERNS = ['test/', 'tests/', '__tests__/', 'spec/', '.test.', '.spec.', '_test.go', '_test.py'];

/* ---------- tree helpers ---------- */

function buildNestedTree(flatTree) {
  const root = { name: '/', type: 'dir', children: [] };
  const dirMap = { '': root };

  // Ensure parent directories exist
  function ensureDir(path) {
    if (dirMap[path]) return dirMap[path];
    const parts = path.split('/');
    const parentPath = parts.slice(0, -1).join('/');
    const parent = ensureDir(parentPath);
    const dir = { name: parts[parts.length - 1], type: 'dir', children: [] };
    parent.children.push(dir);
    dirMap[path] = dir;
    return dir;
  }

  for (const item of flatTree) {
    const parts = item.path.split('/');
    if (item.type === 'tree') {
      ensureDir(item.path);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = ensureDir(parentPath);
      parent.children.push({
        name: parts[parts.length - 1],
        type: 'file',
        size: item.size || 0,
      });
    }
  }

  return root;
}

/* ---------- scoring ---------- */

function scoreDocumentation(flatTree, repoInfo) {
  let score = 40; // base
  const paths = flatTree.map((f) => f.path.toLowerCase());

  if (paths.some((p) => p === 'readme.md')) score += 20;
  if (paths.some((p) => p === 'license' || p === 'license.md')) score += 10;
  if (paths.some((p) => p === 'contributing.md')) score += 10;
  if (paths.some((p) => p === 'changelog.md')) score += 5;
  if (paths.some((p) => p.startsWith('docs/'))) score += 10;
  if (repoInfo.description) score += 5;

  return Math.min(score, 100);
}

function scoreSecurity(issues) {
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const medCount = issues.filter((i) => i.severity === 'medium').length;
  let score = 100;
  score -= highCount * 15;
  score -= medCount * 8;
  return Math.max(score, 10);
}

function scoreStructure(flatTree) {
  let score = 50;
  const paths = flatTree.map((f) => f.path.toLowerCase());

  if (paths.some((p) => p.includes('src/'))) score += 10;
  if (paths.some((p) => p === 'package.json' || p === 'requirements.txt' || p === 'cargo.toml' || p === 'go.mod')) score += 10;
  if (paths.some((p) => p === '.gitignore')) score += 5;
  if (paths.some((p) => CI_FILES.some((ci) => p.includes(ci.toLowerCase())))) score += 10;
  if (paths.some((p) => TEST_PATTERNS.some((t) => p.includes(t.toLowerCase())))) score += 10;
  if (paths.some((p) => p.includes('dockerfile') || p.includes('docker-compose'))) score += 5;

  return Math.min(score, 100);
}

function scoreMaintainability(flatTree, repoInfo) {
  let score = 50;
  const paths = flatTree.map((f) => f.path.toLowerCase());
  const files = flatTree.filter((f) => f.type === 'blob');

  if (repoInfo.license) score += 10;
  if (paths.some((p) => p.includes('.eslintrc') || p.includes('prettier') || p.includes('biome'))) score += 10;
  if (paths.some((p) => p.includes('tsconfig'))) score += 5;
  if (paths.some((p) => TEST_PATTERNS.some((t) => p.includes(t.toLowerCase())))) score += 10;

  // Penalise very large single files
  const bigFiles = files.filter((f) => f.size > 50000);
  score -= bigFiles.length * 5;

  // Penalise repos with very few files (likely incomplete)
  if (files.length < 5) score -= 10;

  return Math.max(Math.min(score, 100), 10);
}

/* ---------- main analysis ---------- */

export async function analyzeRepo(owner, repo) {
  // 1. Fetch data in parallel
  const [repoInfo, languages, flatTree, commits] = await Promise.all([
    fetchRepoInfo(owner, repo),
    fetchLanguages(owner, repo),
    fetchRepoTree(owner, repo).catch(() => []),
    fetchRecentCommits(owner, repo).catch(() => []),
  ]);

  // 2. Detect tech stack
  const techSet = new Set();
  if (repoInfo.language) techSet.add(repoInfo.language);
  Object.keys(languages).forEach((l) => techSet.add(l));

  for (const item of flatTree) {
    const name = item.path.split('/').pop();
    const ext = '.' + name.split('.').pop();
    if (EXT_TO_TECH[ext]) techSet.add(EXT_TO_TECH[ext]);
    for (const [key, tech] of Object.entries(CONFIG_TECH)) {
      if (item.path.toLowerCase().includes(key.toLowerCase())) techSet.add(tech);
    }
  }
  const techStack = [...techSet].sort();

  // 3. Security scan — sample a few key files
  const issues = [];
  const scanCandidates = flatTree
    .filter((f) => f.type === 'blob' && f.size < 100000)
    .filter((f) => {
      const ext = f.path.split('.').pop().toLowerCase();
      return ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rb', 'java', 'php', 'rs', 'yml', 'yaml', 'json', 'env'].includes(ext);
    })
    .slice(0, 30); // limit to 30 files

  for (const file of scanCandidates) {
    try {
      const content = await fetchFileContent(owner, repo, file.path);
      for (const rule of SECURITY_PATTERNS) {
        const matches = content.match(rule.pattern);
        if (matches) {
          issues.push({
            title: rule.title,
            severity: rule.severity,
            file: file.path,
            description: `Found ${matches.length} occurrence(s) in ${file.path}`,
          });
        }
      }
    } catch {
      // Skip files that can't be fetched
    }
  }

  // 4. Build nested file tree
  const fileTree = buildNestedTree(flatTree);

  // 5. Calculate scores
  const scores = {
    documentation: scoreDocumentation(flatTree, repoInfo),
    security: scoreSecurity(issues),
    structure: scoreStructure(flatTree),
    maintainability: scoreMaintainability(flatTree, repoInfo),
  };

  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length,
  );

  // 6. Build summary
  const fileCount = flatTree.filter((f) => f.type === 'blob').length;
  const dirCount = flatTree.filter((f) => f.type === 'tree').length;
  const summary = [
    `${repoInfo.name} is a ${repoInfo.language || 'multi-language'} project`,
    repoInfo.description ? `— ${repoInfo.description}` : '',
    `with ${fileCount} files across ${dirCount} directories.`,
    `It has ${repoInfo.stars} stars, ${repoInfo.forks} forks, and ${repoInfo.openIssues} open issues.`,
    techStack.length > 0 ? `The detected tech stack includes ${techStack.join(', ')}.` : '',
    issues.length > 0 ? `Static analysis found ${issues.length} potential issue(s).` : 'No major issues were detected during static analysis.',
  ].filter(Boolean).join(' ');

  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    repoInfo,
    techStack,
    fileTree,
    issues,
    scores,
    overallScore,
    summary,
    languages,
    commits,
    fileCount,
    analyzedAt: new Date().toISOString(),
  };
}

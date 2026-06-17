import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

function headers() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

/**
 * Fetch basic repository metadata.
 */
export async function fetchRepoInfo(owner, repo) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: headers(),
  });
  return {
    name: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    language: data.language,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    size: data.size,
    license: data.license?.spdx_id || null,
    topics: data.topics || [],
    hasWiki: data.has_wiki,
    archived: data.archived,
  };
}

/**
 * Fetch all languages used in the repo.
 */
export async function fetchLanguages(owner, repo) {
  const { data } = await axios.get(
    `${GITHUB_API}/repos/${owner}/${repo}/languages`,
    { headers: headers() },
  );
  return data; // { JavaScript: 12345, CSS: 678, ... }
}

/**
 * Fetch the full file tree using the Git Trees API (recursive).
 */
export async function fetchRepoTree(owner, repo, branch = 'main') {
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: headers() },
    );
    return data.tree || [];
  } catch {
    // Fallback: try 'master' branch
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers: headers() },
    );
    return data.tree || [];
  }
}

/**
 * Fetch the content of a single file (base64-decoded).
 */
export async function fetchFileContent(owner, repo, path) {
  const { data } = await axios.get(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers: headers() },
  );
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return data.content || '';
}

/**
 * Fetch recent commits (last 10).
 */
export async function fetchRecentCommits(owner, repo) {
  const { data } = await axios.get(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=10`,
    { headers: headers() },
  );
  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    author: c.commit.author?.name || 'Unknown',
    date: c.commit.author?.date,
  }));
}

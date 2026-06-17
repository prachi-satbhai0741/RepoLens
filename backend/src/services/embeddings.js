import { fetchRepoTree, fetchFileContent } from './github.js';

const CODE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'rb', 'php',
  'c', 'cpp', 'h', 'hpp', 'cs', 'swift', 'kt', 'dart', 'vue', 'svelte',
  'css', 'scss', 'html', 'sql', 'sh', 'bash', 'yml', 'yaml', 'json',
  'md', 'txt', 'toml', 'xml', 'graphql', 'proto',
]);

/**
 * Build a simple in-memory search index for a repository.
 * Fetches up to `maxFiles` source files and stores their content.
 */
export async function buildSearchIndex(owner, repo, maxFiles = 25) {
  const tree = await fetchRepoTree(owner, repo);
  const codeFiles = tree
    .filter((f) => f.type === 'blob' && f.size < 80000)
    .filter((f) => {
      const ext = f.path.split('.').pop().toLowerCase();
      return CODE_EXTENSIONS.has(ext);
    })
    .slice(0, maxFiles);

  const indexed = [];
  for (const file of codeFiles) {
    try {
      const content = await fetchFileContent(owner, repo, file.path);
      indexed.push({ path: file.path, content });
    } catch {
      // skip unreachable files
    }
  }

  return indexed;
}

/**
 * Search through indexed files using keyword matching.
 * Returns matching snippets with line numbers.
 */
export function searchCode(query, indexedFiles) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  const results = [];

  for (const file of indexedFiles) {
    const lines = file.content.split('\n');
    const matchingLines = [];

    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      const matchedTerms = terms.filter((t) => lower.includes(t));
      if (matchedTerms.length > 0) {
        matchingLines.push({
          lineNumber: i + 1,
          content: line.trimEnd(),
          matchedTerms,
        });
      }
    });

    if (matchingLines.length > 0) {
      // Relevance = how many unique terms matched + total line matches
      const uniqueTerms = new Set(matchingLines.flatMap((m) => m.matchedTerms));
      const relevance = uniqueTerms.size * 10 + matchingLines.length;

      results.push({
        path: file.path,
        matches: matchingLines.slice(0, 10), // limit to top 10 lines
        totalMatches: matchingLines.length,
        relevance,
      });
    }
  }

  // Sort by relevance descending
  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, 20); // top 20 files
}

/**
 * In-memory data store for analysis history.
 * Keeps the project simple and demo-friendly without requiring a database.
 */

const analyses = [];

export function addAnalysis(data) {
  // Avoid duplicates — update if same repoUrl exists
  const idx = analyses.findIndex(
    (a) => a.repoUrl.toLowerCase() === data.repoUrl.toLowerCase(),
  );
  if (idx >= 0) {
    analyses[idx] = data;
  } else {
    analyses.unshift(data); // newest first
  }
}

export function getHistory() {
  return analyses.slice(0, 50); // return last 50
}

export function findByUrl(repoUrl) {
  return analyses.find(
    (a) => a.repoUrl.toLowerCase() === repoUrl.toLowerCase(),
  ) || null;
}

// Also store search indices keyed by repoUrl
const searchIndices = new Map();

export function setSearchIndex(repoUrl, index) {
  searchIndices.set(repoUrl.toLowerCase(), index);
}

export function getSearchIndex(repoUrl) {
  return searchIndices.get(repoUrl.toLowerCase()) || null;
}

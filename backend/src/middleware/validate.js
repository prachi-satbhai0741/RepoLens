/**
 * Middleware to validate and parse GitHub repository URLs.
 */

const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/;

export function validateRepoUrl(body) {
  const { repoUrl } = body || {};

  if (!repoUrl || typeof repoUrl !== 'string') {
    return { error: 'repoUrl is required and must be a string.' };
  }

  const cleaned = repoUrl.trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const match = cleaned.match(GITHUB_URL_REGEX);

  if (!match) {
    return {
      error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo',
    };
  }

  return { owner: match[1], repo: match[2], repoUrl: cleaned };
}

import { Hono } from 'hono';
import { validateRepoUrl } from '../middleware/validate.js';
import { searchCode, buildSearchIndex } from '../services/embeddings.js';
import { getSearchIndex, setSearchIndex } from '../models/db.js';

const search = new Hono();

/**
 * POST /api/search
 * Accepts { repoUrl, query } and returns matching code snippets.
 */
search.post('/', async (c) => {
  const body = await c.req.json();
  const { query } = body;
  const parsed = validateRepoUrl(body);

  if (parsed.error) {
    return c.json({ error: parsed.error }, 400);
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return c.json({ error: 'A search query is required.' }, 400);
  }

  const { owner, repo, repoUrl } = parsed;

  try {
    // Check if we have a cached search index
    let index = getSearchIndex(repoUrl);

    if (!index) {
      // Build one on the fly
      index = await buildSearchIndex(owner, repo);
      setSearchIndex(repoUrl, index);
    }

    const results = searchCode(query.trim(), index);
    return c.json({ results, total: results.length });
  } catch (err) {
    console.error('Search error:', err.message);
    return c.json({ error: `Search failed: ${err.message}` }, 500);
  }
});

export default search;

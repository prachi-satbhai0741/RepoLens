import { Hono } from 'hono';
import { validateRepoUrl } from '../middleware/validate.js';
import { analyzeRepo } from '../services/analyzer.js';
import { generateReview } from '../services/ai.js';
import { buildSearchIndex } from '../services/embeddings.js';
import { addAnalysis, setSearchIndex } from '../models/db.js';

const analyze = new Hono();

/**
 * POST /api/analyze
 * Accepts { repoUrl } and returns full analysis results.
 */
analyze.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = validateRepoUrl(body);

  if (parsed.error) {
    return c.json({ error: parsed.error }, 400);
  }

  const { owner, repo, repoUrl } = parsed;

  try {
    const data = await analyzeRepo(owner, repo);

    // Store in history
    addAnalysis(data);

    // Build search index in background (don't block the response)
    buildSearchIndex(owner, repo)
      .then((index) => setSearchIndex(repoUrl, index))
      .catch(() => {});

    return c.json(data);
  } catch (err) {
    console.error('Analysis error:', err.message);
    const status = err.response?.status;
    if (status === 404) {
      return c.json({ error: 'Repository not found. Check the URL and try again.' }, 404);
    }
    if (status === 403) {
      return c.json({ error: 'GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN.' }, 429);
    }
    return c.json({ error: `Analysis failed: ${err.message}` }, 500);
  }
});

/**
 * POST /api/analyze/review
 * Accepts { repoUrl, analysisData } and returns an AI-powered code review.
 */
analyze.post('/review', async (c) => {
  const body = await c.req.json();
  const { repoUrl, analysisData } = body;

  if (!repoUrl || !analysisData) {
    return c.json({ error: 'repoUrl and analysisData are required.' }, 400);
  }

  try {
    const review = await generateReview(repoUrl, analysisData);
    return c.json({ review });
  } catch (err) {
    console.error('Review error:', err.message);
    return c.json({ error: `Review generation failed: ${err.message}` }, 500);
  }
});

export default analyze;

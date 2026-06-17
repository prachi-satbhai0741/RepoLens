import { Hono } from 'hono';
import { getHistory } from '../models/db.js';

const history = new Hono();

/**
 * GET /api/history
 * Returns all previously analyzed repositories.
 */
history.get('/', (c) => {
  const items = getHistory();
  return c.json({ history: items });
});

export default history;

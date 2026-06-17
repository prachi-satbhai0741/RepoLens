import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import analyzeRoutes from '../backend/src/routes/analyze.js';
import historyRoutes from '../backend/src/routes/history.js';
import searchRoutes from '../backend/src/routes/search.js';

const app = new Hono();

app.use('*', cors());

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount routes
app.route('/api/analyze', analyzeRoutes);
app.route('/api/history', historyRoutes);
app.route('/api/search', searchRoutes);

export default handle(app);

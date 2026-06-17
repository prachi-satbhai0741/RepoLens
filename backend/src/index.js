import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';

import analyzeRoutes from './routes/analyze.js';
import historyRoutes from './routes/history.js';
import searchRoutes from './routes/search.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.route('/api/analyze', analyzeRoutes);
app.route('/api/history', historyRoutes);
app.route('/api/search', searchRoutes);

// Start server
const port = parseInt(process.env.PORT || '5000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`🔍 RepoLens API running on http://localhost:${port}`);
});

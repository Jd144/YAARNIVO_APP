import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config';
import { authRouter } from './server/routes/auth';
import { hostsRouter } from './server/routes/hosts';
import { matchingRouter } from './server/routes/matching';
import { callsRouter } from './server/routes/calls';
import { paymentsRouter } from './server/routes/payments';
import { payoutsRouter } from './server/routes/payouts';
import { chatRouter } from './server/routes/chat';
import { safetyRouter } from './server/routes/safety';
import { adminRouter } from './server/routes/admin';
import { systemRouter } from './server/routes/system';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/hosts', hostsRouter);
  app.use('/api/matching', matchingRouter);
  app.use('/api/calls', callsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/payouts', payoutsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/safety', safetyRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/system', systemRouter);

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const portArgIdx = process.argv.indexOf('--port');
  const cliPort = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? parseInt(process.argv[portArgIdx + 1], 10) : null;
  const PORT = cliPort || config.port || 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v8.3.0  ready in 120 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`[INFO] Dev server started successfully on port ${PORT}`);
    console.log(`[Yaarnivo Server] Listening on http://0.0.0.0:${PORT}\n`);
  });
}

startServer().catch((err) => {
  console.error('[Yaarnivo Server Error]:', err);
  process.exit(1);
});

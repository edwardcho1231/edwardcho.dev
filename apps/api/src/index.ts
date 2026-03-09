import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { apiRouter } from './routes';

const app = express();
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(
      origin: string | undefined,
      callback: (
        error: Error | null,
        options?: boolean | string | RegExp | string[]
      ) => void
    ) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/v1', apiRouter);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: {
      code: err?.code || "INTERNAL_SERVER_ERROR",
      message: err?.message || "Internal Server Error",
    },
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});

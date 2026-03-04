import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { apiRouter } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/v1', apiRouter);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});

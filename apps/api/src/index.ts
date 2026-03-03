import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { apiRouter } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/v1', apiRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
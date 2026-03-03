import { Router } from 'express';
import { healthRouter } from './health.ts';
import { documentRouter } from './documents.routes.ts';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/documents', documentRouter);
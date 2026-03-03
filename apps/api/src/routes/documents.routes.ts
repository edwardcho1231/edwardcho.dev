import { Router } from "express";
import { requireAuth } from "@clerk/express";

export const documentRouter = Router();

documentRouter.use(requireAuth());

documentRouter.get("/", (req, res) => {
  res.json({ userId: req.auth.userId, documents: [] });
});

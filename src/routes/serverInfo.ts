import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { cryptoApi } from "../services/cryptoApi.js";

const router = Router();

// Get trade server information
router.get(
  "/info",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const serverInfo = await cryptoApi.getServerInfo();
    res.json({
      success: true,
      data: serverInfo,
    });
  }),
);

export default router;

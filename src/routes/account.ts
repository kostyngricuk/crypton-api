import { Router } from "express";
import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { cryptoApi } from "../services/cryptoApi.js";

const router = Router();

// Get list of all cash account assets
router.get(
  "/assets",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const assets = await cryptoApi.getAccountAssets();
    res.json({
      success: true,
      data: assets,
    });
  }),
);

// Get cash account assets by currency name
router.get(
  "/assets/:currency",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currency } = req.params;
    if (!currency) {
      throw new AppError("Currency is required", 400);
    }
    const asset = await cryptoApi.getAccountAsset(currency);
    res.json({
      success: true,
      data: asset,
    });
  }),
);

export default router;

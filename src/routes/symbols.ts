import { Router } from "express";
import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { cryptoApi } from "../services/cryptoApi.js";

const router = Router();

// Get all symbols
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const symbols = await cryptoApi.getSymbols();
    res.json({
      success: true,
      data: symbols,
    });
  }),
);

// Get symbol by name
router.get(
  "/:symbol",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { symbol } = req.params;
    if (!symbol) {
      throw new AppError("Symbol is required", 400);
    }
    const symbolData = await cryptoApi.getSymbol(symbol);
    res.json({
      success: true,
      data: symbolData,
    });
  }),
);

// Get ticks by name
router.get(
  "/ticks/:symbol",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { symbol } = req.params;
    if (!symbol) {
      throw new AppError("Symbol is required", 400);
    }
    const tickData = await cryptoApi.getTick(symbol);
    res.json({
      success: true,
      data: tickData,
    });
  }),
);

export default router;

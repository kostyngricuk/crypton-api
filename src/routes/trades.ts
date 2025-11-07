import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { cryptoApi } from "../services/cryptoApi.js";

const router = Router();

// Validation schemas
const CreateTradeSchema = z.object({
  Symbol: z.string().min(1, "Symbol is required"),
  Side: z.enum(["Buy", "Sell"], { required_error: "Side must be 'Buy' or 'Sell'" }),
  Amount: z.string().min(1, "Amount is required"),
});

// Get trade history with optional filters
router.post(
  "/history",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const trades = await cryptoApi.getTradesHistory(req.body);
    res.json({
      success: true,
      data: trades,
    });
  }),
);

// Get list of available trades
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const trades = await cryptoApi.getTrades();
    res.json({
      success: true,
      data: trades,
    });
  }),
);

// Create new trade
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = CreateTradeSchema.parse(req.body);
    const trade = await cryptoApi.createTrade(validatedData);
    res.status(201).json({
      success: true,
      data: trade,
    });
  }),
);

// Get trade by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
      throw new AppError("Trade ID is required", 400);
    }
    const trade = await cryptoApi.getTrade(id);
    res.json({
      success: true,
      data: trade,
    });
  }),
);

// Cancel or close existing trade
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
      throw new AppError("Trade ID is required", 400);
    }
    const trade = await cryptoApi.cancelTrade(id);
    res.json({
      success: true,
      data: trade,
      message: "Trade cancelled successfully",
    });
  }),
);

export default router;

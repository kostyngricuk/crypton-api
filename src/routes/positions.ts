import { Router } from "express";
import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { cryptoApi } from "../services/cryptoApi.js";

const router = Router();

// Get list of available positions
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const positions = await cryptoApi.getPositions();
    res.json({
      success: true,
      data: positions,
    });
  }),
);

// Get position by ID or symbol name
router.get(
  "/:identifier",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { identifier } = req.params;
    if (!identifier) {
      throw new AppError("Position ID or symbol is required", 400);
    }
    const position = await cryptoApi.getPosition(identifier);
    res.json({
      success: true,
      data: position,
    });
  }),
);

export default router;

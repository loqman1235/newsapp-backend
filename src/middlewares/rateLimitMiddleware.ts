import { rateLimit } from "express-rate-limit";
import config from "../config";
import { NextFunction, Response } from "express";

export const rateLimitMiddleware = rateLimit({
  windowMs: config.RETE_LIMIT_TIME_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later",

  handler: (req, res: Response, next: NextFunction) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again after an hour",
    });

    next();

    console.log(
      "Too many requests from this IP, please try again after an hour"
    );
  },
});

export default rateLimitMiddleware;

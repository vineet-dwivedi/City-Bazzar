import { NextFunction, Request, Response } from "express";
import { tooManyRequests } from "../utils/api-error.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Small in-process limiter for auth/upload/onboarding hotspots.
export const rateLimit = (options: {
  key: string;
  limit: number;
  windowMs: number;
}) => (request: Request, _response: Response, next: NextFunction) => {
  const now = Date.now();
  const actor = request.ip || "unknown";
  const bucketKey = `${options.key}:${actor}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs
    });
    next();
    return;
  }

  if (current.count >= options.limit) {
    next(tooManyRequests(`Too many ${options.key} requests. Please wait a moment.`));
    return;
  }

  current.count += 1;
  next();
};

export const resetRateLimitsForTests = () => {
  buckets.clear();
};

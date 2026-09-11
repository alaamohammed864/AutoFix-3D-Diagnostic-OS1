import { RateLimiterConfig } from './types';
import { logger } from './logger';

export class TokenBucketRateLimiter {
  private maxTokens: number;
  private refillRatePerSec: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(config: RateLimiterConfig = { maxTokens: 5, refillRatePerSec: 2 }) {
    this.maxTokens = config.maxTokens;
    this.refillRatePerSec = config.refillRatePerSec;
    this.tokens = config.maxTokens;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    if (elapsedSeconds > 0) {
      const addedTokens = elapsedSeconds * this.refillRatePerSec;
      this.tokens = Math.min(this.maxTokens, this.tokens + addedTokens);
      this.lastRefillTimestamp = now;
    }
  }

  /**
   * Acquires a token. If none available, waits until a token is refilled.
   * Prevents hammering external resources and respects rate limits.
   */
  public async acquireToken(cost: number = 1): Promise<void> {
    this.refill();

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return;
    }

    const tokensNeeded = cost - this.tokens;
    const waitSeconds = tokensNeeded / this.refillRatePerSec;
    const waitMs = Math.ceil(waitSeconds * 1000) + 50;

    logger.warn(
      'rate_limit_throttle',
      `Rate limit reached. Throttling request for ${waitMs}ms to respect polite crawling policies.`,
      { activeTokens: Math.floor(this.tokens), waitMs }
    );

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    this.refill();
    this.tokens = Math.max(0, this.tokens - cost);
  }

  public getStatus(): { activeTokens: number; maxTokens: number; refillRate: number } {
    this.refill();
    return {
      activeTokens: Math.round(this.tokens * 10) / 10,
      maxTokens: this.maxTokens,
      refillRate: this.refillRatePerSec,
    };
  }
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  factor?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}

/**
 * Executes an async operation with exponential backoff and jitter.
 */
export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 600,
    factor = 2.0,
    maxDelayMs = 6000,
    jitter = true,
  } = options;

  let attempt = 1;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= maxRetries) {
        logger.error(
          'retry_backoff',
          `Operation failed after maximum (${maxRetries}) attempts: ${(error as Error).message}`,
          { finalAttempt: attempt }
        );
        throw error;
      }

      // Calculate exponential delay with optional random jitter
      let currentDelay = Math.min(delay, maxDelayMs);
      if (jitter) {
        const jitterFactor = 0.8 + Math.random() * 0.4; // 80% - 120%
        currentDelay = Math.floor(currentDelay * jitterFactor);
      }

      logger.warn(
        'retry_backoff',
        `Attempt ${attempt} failed with: ${(error as Error).message}. Retrying in ${currentDelay}ms...`,
        { attempt, nextDelayMs: currentDelay }
      );

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      delay *= factor;
      attempt++;
    }
  }

  throw new Error('Exceeded maximum retry attempts');
}

export const rateLimiter = new TokenBucketRateLimiter();

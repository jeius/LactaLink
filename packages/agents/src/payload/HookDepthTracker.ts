import { type PayloadRequest } from 'payload';
import { getHookContext, setHookContext } from './hookContext';

/**
 * Utility class to track and manage the current depth of hook execution within a
 * Payload request context.
 *
 * @description
 * This is useful for preventing infinite recursion in hooks that may trigger other hooks,
 * allowing you to conditionally adjust behavior based on how deep you are in the hook call stack.
 */
export class HookDepthTracker {
  private static readonly contextKey = 'hook-depth-tracker';

  private static _getDefaultDepth(req: PayloadRequest): number {
    return req.payload.config.defaultDepth ?? 2;
  }

  private static _getDepthFromQuery(req: PayloadRequest): number | undefined {
    const { depth } = req.query;
    if (typeof depth === 'string') {
      const parsed = parseInt(depth, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  /**
   * Initializes the hook depth in the request context to a specified value.
   * If no depth is set, it uses the default depth defined in the
   * Payload config or `2` if not defined.
   *
   * @param req - The Payload request object.
   * @param depth - The depth value to initialize.
   * @return The initialized depth value.
   */
  static initialize(req: PayloadRequest, depth?: number): number {
    const defaultDepth = this._getDefaultDepth(req);
    const initialDepth = depth ?? this._getDepthFromQuery(req) ?? defaultDepth;
    setHookContext(req, this.contextKey, initialDepth);
    return this.getCurrentDepth(req) ?? initialDepth;
  }

  /**
   * Gets the current hook depth from the request context.
   *
   * @param req - The Payload request object.
   * @returns The current hook depth as a number. `undefined` if not set.
   */
  static getCurrentDepth(req: PayloadRequest): number | undefined {
    return getHookContext<number>(req, this.contextKey);
  }

  /**
   * Increments the current hook depth by 1 and updates the request context.
   *
   * @param req - The Payload request object.
   * @returns The new depth after incrementing.
   */
  static incrementDepth(req: PayloadRequest): number {
    const currentDepth = this.getCurrentDepth(req);
    const defaultDepth = this._getDefaultDepth(req);
    const newDepth = (currentDepth || defaultDepth) + 1;
    setHookContext(req, this.contextKey, newDepth);
    return newDepth;
  }

  /**
   * Decrements the current hook depth by 1 and updates
   * the request context.
   *
   * @param req - The Payload request object.
   * @returns The new depth after decrementing.
   */
  static decrementDepth(req: PayloadRequest): number {
    const currentDepth = this.getCurrentDepth(req);
    const defaultDepth = this._getDefaultDepth(req);
    const newDepth = (currentDepth || defaultDepth) - 1;
    setHookContext(req, this.contextKey, newDepth);
    return newDepth;
  }

  /**
   * Sets the current hook depth to a specific value in the request context.
   *
   * @param req - The Payload request object.
   * @param value - The depth value to set.
   */
  static setDepth(req: PayloadRequest, value: number): void {
    setHookContext(req, this.contextKey, value);
  }

  /**
   * Checks if the hook depth has been initialized in the request context.
   *
   * @param req - The Payload request object.
   * @returns `true` if the hook depth is initialized, `false` otherwise.
   */
  static hasInitialized(req: PayloadRequest): boolean {
    return this.getCurrentDepth(req) !== undefined;
  }

  /**
   * Checks if the current hook depth has reached or exceeded the maximum allowed depth.
   *
   * @param req - The Payload request object.
   * @returns `true` if the maximum depth has been reached or exceeded, `false` otherwise.
   */
  static hasReachedMaxDepth(req: PayloadRequest): boolean {
    const currentDepth = this.getCurrentDepth(req);
    if (currentDepth === undefined) {
      this.initialize(req);
      return false;
    }
    return currentDepth < 0;
  }
}

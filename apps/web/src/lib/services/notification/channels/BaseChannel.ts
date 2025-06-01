import { Notification, NotificationChannel, NotificationChannelStats } from '@lactalink/types';
import { Payload } from 'payload';

/**
 * Base class for notification channels.
 * Provides common functionality for sending notifications and handling retries.
 * Subclasses must implement the `sendNotification` method.
 */
export abstract class BaseChannel {
  constructor(
    protected payload: Payload,
    protected channel: NotificationChannel
  ) {}

  /**
   * Sends a notification using the channel.
   * Handles retries and scheduling logic.
   */
  async send(
    notification: Notification,
    channelStat: NotificationChannelStats[number]
  ): Promise<NotificationChannelStats[number]> {
    // Skip if scheduled for future
    if (this.isScheduledForFuture(channelStat)) {
      return channelStat;
    }

    try {
      channelStat.attempts = (channelStat.attempts ?? 0) + 1;
      channelStat.lastAttemptAt = new Date().toISOString();

      await this.sendNotification(notification);

      // Success - mark as sent
      channelStat.sent = true;
      channelStat.sentAt = new Date().toISOString();
      channelStat.failureReason = undefined; // Clear any previous failure reason
    } catch (error) {
      if (!(error instanceof Error)) {
        console.error(
          `Unexpected error type for channel "${this.channel.name}": ${error}. ` +
            `Expected an instance of Error.`
        );
        throw new Error('Unexpected error type');
      }

      const errorMessage = error.message || 'Unknown error occurred';
      channelStat.failureReason = errorMessage;

      if (this.isRetryableError(error)) {
        console.warn(
          `Retryable error for channel "${this.channel.name}": ${errorMessage}. ` +
            `Attempt ${channelStat.attempts} of ${this.channel.delivery?.retrySettings?.maxRetries || 3}`
        );

        this.handleRetry(channelStat, errorMessage);
      }
    }

    return channelStat;
  }

  /**
   * Abstract method to send the notification.
   * Must be implemented by subclasses to handle specific channel logic.
   */
  protected abstract sendNotification(notification: Notification): Promise<void>;

  /**
   * Check if notification is scheduled for future delivery
   */
  private isScheduledForFuture(channelStat: NotificationChannelStats[number]): boolean {
    return !!(
      channelStat.scheduled &&
      channelStat.scheduledFor &&
      new Date(channelStat.scheduledFor) > new Date()
    );
  }

  /**
   * Handle retry logic for failed notifications
   */
  private handleRetry(channelStat: NotificationChannelStats[number], errorMessage: string): void {
    const retrySettings = this.channel.delivery?.retrySettings;
    const maxRetries = retrySettings?.maxRetries || 3;
    const retryDelay = retrySettings?.retryDelay || 5; // minutes
    const currentAttempts = channelStat.attempts || 0;

    if (currentAttempts < maxRetries) {
      // Schedule for retry
      const retryTime = new Date();
      retryTime.setMinutes(retryTime.getMinutes() + retryDelay);

      channelStat.scheduled = true;
      channelStat.scheduledFor = retryTime.toISOString();

      console.log(
        `Scheduling retry ${currentAttempts}/${maxRetries} for channel "${this.channel.name}" ` +
          `in ${retryDelay} minutes. Error: ${errorMessage}`
      );

      // TODO: Add to retry queue/job system
      this.scheduleRetry(channelStat, retryTime);
    } else {
      // Max retries exceeded
      console.error(
        `Max retries (${maxRetries}) exceeded for channel "${this.channel.name}". ` +
          `Final error: ${errorMessage}`
      );

      // Mark as permanently failed
      channelStat.scheduled = false;
      channelStat.scheduledFor = undefined;

      // TODO: Trigger escalation/notification to admins
      this.handleMaxRetriesExceeded(channelStat, errorMessage);
    }
  }

  /**
   * Schedule a retry (to be implemented with your job queue system)
   */
  private scheduleRetry(_channelStat: NotificationChannelStats[number], retryTime: Date): void {
    // TODO: Implement with your job queue system (Bull, Agenda, etc.)
    console.log(`TODO: Schedule retry job for ${retryTime.toISOString()}`);

    // Example implementation ideas:
    // - Add to Redis queue
    // - Schedule with node-cron
    // - Use database-based job queue
    // - Integrate with external job processor
  }

  /**
   * Handle case when max retries are exceeded
   */
  private handleMaxRetriesExceeded(
    _channelStat: NotificationChannelStats[number],
    _finalError: string
  ): void {
    // TODO: Implement escalation logic
    console.error(`Notification delivery permanently failed for channel ${this.channel.name}`);

    // Example escalation actions:
    // - Send alert to administrators
    // - Log to monitoring system
    // - Mark channel as problematic
    // - Switch to fallback channel

    // You could trigger a system notification here:
    // this.triggerSystemAlert({
    //   type: 'DELIVERY_FAILURE',
    //   channelId: this.channel.id,
    //   error: finalError,
    //   attempts: channelStat.attempts
    // });
  }

  protected calculateRetryDelay(attempt: number): number {
    const retrySettings = this.channel.delivery?.retrySettings;
    const retryStrategy = retrySettings?.strategy || 'FIXED';
    const baseDelay = retrySettings?.retryDelay || 5; // Default to 5 minutes

    switch (retryStrategy) {
      case 'EXPONENTIAL':
        // Exponential backoff: baseDelay * 2^(attempt-1)
        return baseDelay * Math.pow(2, attempt - 1);

      case 'LINEAR':
        // Linear backoff: baseDelay * attempt
        return baseDelay * attempt;

      case 'FIXED':
      default:
        // Fixed delay
        return baseDelay;
    }
  }

  protected isRetryableError(error: Error): boolean {
    // Define which errors should trigger retries
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Network Error',
      'Rate limit exceeded',
      'Service temporarily unavailable',
    ];

    const nonRetryableErrors = [
      'Invalid email address',
      'Invalid phone number',
      'Authentication failed',
      'Permission denied',
      'Invalid API key',
    ];

    const errorMessage = error.message.toLowerCase();

    // Don't retry if explicitly non-retryable
    if (nonRetryableErrors.some((msg) => errorMessage.includes(msg.toLowerCase()))) {
      return false;
    }

    // Retry if explicitly retryable
    if (retryableErrors.some((msg) => errorMessage.includes(msg.toLowerCase()))) {
      return true;
    }

    // Default: retry unless it's a 4xx HTTP error (client error)
    if (error.message.includes('HTTP') && /4\d\d/.test(error.message)) {
      return false;
    }

    return true; // Default to retryable
  }
}

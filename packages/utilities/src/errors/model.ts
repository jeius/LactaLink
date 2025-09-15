import { ValidationErrorNames } from '@lactalink/enums/error-names';

interface ErrorOptions {
  cause?: unknown;
  name?: string;
  statusCode?: number;
  statusText?: string;
}

export class BaseError extends Error {
  statusCode?: number;
  statusText?: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message);
    this.name = options?.name || 'unknown_error';
    this.statusCode = options?.statusCode || 500;
    this.statusText = options?.statusText || 'Internal Server Error';
    this.cause = options?.cause;

    // Ensure the prototype chain is maintained
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, { ...options, name: ValidationErrorNames.DEFAULT });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

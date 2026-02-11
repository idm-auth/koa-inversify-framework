export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  details?: ValidationErrorDetail[];
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  toResponse(): ValidationErrorResponse {
    return {
      error: this.name,
      message: this.message,
      details: this.details,
    };
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "UNPROCESSABLE_ENTITY";

abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract code: ErrorCode;
  details?: ValidationErrorDetail[];

  constructor(message: string, details?: ValidationErrorDetail[]) {
    super(message);
    this.details = details || []; // Initialize the property in the constructor
  }

  abstract serialize(): {
    message: string;
    code: ErrorCode;
    details?: ValidationErrorDetail[];
  };
}

export default CustomError;

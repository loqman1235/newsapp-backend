import CustomError, {
  ErrorCode,
  ValidationErrorDetail,
} from "../utils/CustomError";

export class ValidationError extends CustomError {
  statusCode = 400;
  code: ErrorCode = "VALIDATION_ERROR";
  constructor(message: string, details?: ValidationErrorDetail[]) {
    super(message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  serialize(): {
    message: string;
    code: ErrorCode;
    details?: ValidationErrorDetail[];
  } {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

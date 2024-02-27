import CustomError, { ErrorCode } from "../utils/CustomError";

export class AuthError extends CustomError {
  statusCode = 401;
  code: ErrorCode = "UNAUTHORIZED";
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  serialize(): { message: string; code: ErrorCode } {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

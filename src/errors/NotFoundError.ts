import CustomError, { ErrorCode } from "../utils/CustomError";

export class NotFoundError extends CustomError {
  statusCode = 404;
  code: ErrorCode = "NOT_FOUND";
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serialize(): { message: string; code: ErrorCode } {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

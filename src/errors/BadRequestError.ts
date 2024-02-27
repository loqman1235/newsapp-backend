import CustomError, { ErrorCode } from "../utils/CustomError";

export class BadRequestError extends CustomError {
  statusCode = 400;
  code: ErrorCode = "BAD_REQUEST";
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serialize(): { message: string; code: ErrorCode } {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

import CustomError, { ErrorCode } from "../utils/CustomError";

export class DatabaseError extends CustomError {
  statusCode = 500;
  code: ErrorCode = "DATABASE_ERROR";
  constructor() {
    super("Something went wrong with the database");
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  serialize(): { message: string; code: ErrorCode } {
    return {
      message: "Database error",
      code: this.code,
    };
  }
}

import { Role } from "@prisma/client";

export interface CustomRequest extends Request {
  userId: string;
  role: Role;
}

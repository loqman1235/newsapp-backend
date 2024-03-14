import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { Role } from "@prisma/client";

const createAccessToken = (payload: { userId: string; role: Role }) => {
  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const createRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET) as JwtPayload;
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET) as JwtPayload;
};

export {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

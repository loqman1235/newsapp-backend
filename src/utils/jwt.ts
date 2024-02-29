import jwt, { JwtPayload } from "jsonwebtoken";

const createAccessToken = (payload: { userId: string }) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "40s",
  });
};

const createRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
};

export {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

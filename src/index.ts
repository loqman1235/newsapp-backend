import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
// import "express-async-errors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import errorHandler from "./middlewares/errorMiddleware";
import { NotFoundError } from "./errors/NotFoundError";
import config from "./config";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

//  404 route not found
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Route not found"));
});

// Middleware for Custom Error Handling
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server listening on http://${config.HOST}:${config.PORT}`);
});

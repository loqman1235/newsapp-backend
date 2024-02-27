import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
// import "express-async-errors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import errorHandler from "./middlewares/errorMiddleware";
import { NotFoundError } from "./errors/NotFoundError";

dotenv.config();

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "localhost";

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

app.listen(PORT, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

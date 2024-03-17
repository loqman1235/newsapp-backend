import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/post.route";
import catRoutes from "./routes/category.route";
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
    origin: config.CLIENT_URL,
  })
);
app.use(cookieParser());
app.use(helmet());

app.use(express.static("public/uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/cats", catRoutes);

//  404 route not found
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Route not found"));
});

// Middleware for Custom Error Handling
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server listening on http://${config.HOST}:${config.PORT}`);
});

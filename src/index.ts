import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import AuthRouter from "./routes/auth/auth-routes";
import cookieParser from "cookie-parser";
import getUserMiddleware from "./middlewares/get-user-middleware";
import PostsRouter from "./routes/posts/posts-routes";

export const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(getUserMiddleware);

app.use("/auth", AuthRouter);
app.use("/posts", PostsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

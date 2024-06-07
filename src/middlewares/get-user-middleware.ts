import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import { prisma } from "..";

const getUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  if (token) {
    const user = await prisma.user.findUnique({
      where: {
        token,
      },
    });
    req.user = user;
  }

  next();
};

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

export default getUserMiddleware;

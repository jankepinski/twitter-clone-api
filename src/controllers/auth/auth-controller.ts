import { Request, Response } from "express";
import { generateToken } from "../../utils/token";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "../../setup/prisma";

const AuthController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({
        error: "Missing one of the following fields: name, email, password",
      });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          token: generateToken(),
          profile: {
            create: {
              bio: null,
            },
          },
        },
      });
      return res
        .cookie("accessToken", user.token, {
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .json({
          name: user.name,
          email: user.email,
        });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(409)
            .json({ error: "User with provided email already exists" });
        }
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        error: "Missing one of the following fields: email, password",
      });
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(401).json({ error: "Invalid email" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }
      return res
        .cookie("accessToken", user.token, {
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .json({
          name: user.name,
          email: user.email,
        });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async logout(req: Request, res: Response) {
    return res
      .clearCookie("accessToken", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      })
      .json({ message: "Logged out" });
  },
  getMyProfile: async (req: Request, res: Response) => {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        name: true,
        id: true,
        profile: true,
      },
    });
    const aggregatedPosts = await prisma.post.aggregate({
      where: {
        authorId: user.id,
      },
      _count: true,
    });

    res.json({ ...profile, postCount: aggregatedPosts._count });
  },
};

export default AuthController;

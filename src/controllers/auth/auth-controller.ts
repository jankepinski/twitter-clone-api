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
        },
      });
      res
        .cookie("accessToken", user.token, { httpOnly: true, secure: true })
        .json({
          name: user.name,
          email: user.email,
        });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res
            .status(409)
            .json({ error: "User with provided email already exists" });
          return;
        }
      }
      res.status(500).json({ error: "Internal server error" });
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
        res.status(401).json({ error: "Invalid email" });
        return;
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
      res
        .cookie("accessToken", user.token, { httpOnly: true, secure: true })
        .json({
          name: user.name,
          email: user.email,
        });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default AuthController;

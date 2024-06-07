import { Request, Response } from "express";
import { prisma } from "../../setup/prisma";

const ProfileController = {
  getProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        profile: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      name: user.name,
      profile: user.profile,
    });
  },
  getMyProfile: async (req: Request, res: Response) => {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });
    res.json({ name: user.name, profile });
  },
  updateProfile: async (req: Request, res: Response) => {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { bio } = req.body;
    try {
      const profile = await prisma.profile.update({
        where: {
          userId: user.id,
        },
        data: {
          bio,
        },
      });
      res.json(profile);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
export default ProfileController;

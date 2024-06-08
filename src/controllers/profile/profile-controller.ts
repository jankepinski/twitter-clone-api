import { Request, Response } from "express";
import { prisma } from "../../setup/prisma";

const ProfileController = {
  getProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    const profile = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        name: true,
        id: true,
        profile: true,
      },
    });
    const aggregatedPosts = await prisma.post.aggregate({
      where: {
        authorId: parseInt(id),
      },
      _count: true,
    });

    res.json({ ...profile, postCount: aggregatedPosts._count });
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

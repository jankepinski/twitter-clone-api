import { Request, Response } from "express";
import { prisma } from "../../setup/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const PostsController = {
  async getPosts(req: Request, res: Response) {
    const posts = await prisma.post.findMany({
      where: {
        parentId: null,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    res.json(
      posts.map((post) => {
        return {
          ...post,
          author: post.author.name,
        };
      })
    );
  },
  async getPost(req: Request, res: Response) {
    const { id } = req.params;
    const authorId = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        authorId: true,
      },
    });
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        children: {
          include: {
            children: {
              where: { authorId: authorId?.authorId },
              include: { author: { select: { name: true } } },
            },
            author: { select: { name: true } },
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        parent: {
          select: {
            authorId: true,
            content: true,
            author: {
              select: { name: true },
            },
          },
        },
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({
      ...post,
      author: post.author.name,
      children: post.children.map((child) => {
        return {
          ...child,
          author: child.author.name,
          children: child.children.map((child) => {
            return {
              ...child,
              author: child.author.name,
            };
          }),
        };
      }),
    });
  },
  async getMyPosts(req: Request, res: Response) {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentId: null,
      },
    });
    res.json(posts);
  },
  async getMyPostsAndReplies(req: Request, res: Response) {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
      },
    });
    res.json(posts);
  },
  async createPost(req: Request, res: Response) {
    const { content, parentId } = req.body;
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!content)
      return res.status(400).json({ error: "Missing content field" });
    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId: user.id,
          parentId: parentId ? parseInt(parentId) : null,
        },
      });

      res.json(post);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          return res.status(404).json({ error: "Parent post not found" });
        }
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
  async updatePost(req: Request, res: Response) {
    const { user } = req;
    const { id } = req.params;
    const { content } = req.body;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!content)
      return res.status(400).json({ error: "Missing content field" });
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== user.id)
      return res.status(403).json({ error: "Forbidden" });
    const updatedPost = await prisma.post.update({
      where: {
        id: parseInt(id),
      },
      data: {
        content,
      },
    });
    res.json(updatedPost);
  },

  async deletePost(req: Request, res: Response) {
    const { user } = req;
    const { id } = req.params;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== user.id)
      return res.status(403).json({ error: "Forbidden" });
    await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json({ message: "Post deleted" });
  },
};

export default PostsController;

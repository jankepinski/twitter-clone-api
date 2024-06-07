import { Request, Response } from "express";

const PostsController = {
  async getPosts(req: Request, res: Response) {
    const { user } = req;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.send("Get all posts");
  },
  async getPost(req: Request, res: Response) {
    res.send("Get a post");
  },
  async createPost(req: Request, res: Response) {
    res.send("Create a post");
  },
  async updatePost(req: Request, res: Response) {
    res.send("Update a post");
  },
  async deletePost(req: Request, res: Response) {
    res.send("Delete a post");
  },
};

export default PostsController;

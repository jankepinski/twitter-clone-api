import { Router } from "express";
import PostsController from "../../controllers/posts/posts-controller";

const PostsRouter = Router();

PostsRouter.get("/", PostsController.getPosts);
PostsRouter.get("/:id", PostsController.getPost);
PostsRouter.post("/", PostsController.createPost);
PostsRouter.patch("/:id", PostsController.updatePost);
PostsRouter.delete("/:id", PostsController.deletePost);

export default PostsRouter;
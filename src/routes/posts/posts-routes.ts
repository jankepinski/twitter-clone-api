import { Router } from "express";
import PostsController from "../../controllers/posts/posts-controller";

const PostsRouter = Router();

PostsRouter.get("/", PostsController.getPosts);
PostsRouter.post("/", PostsController.createPost);
PostsRouter.get("/my-posts", PostsController.getMyPosts);
PostsRouter.get("/my-posts-and-replies", PostsController.getMyPostsAndReplies);
PostsRouter.get("/:id", PostsController.getPost);
PostsRouter.patch("/:id", PostsController.updatePost);
PostsRouter.delete("/:id", PostsController.deletePost);

export default PostsRouter;

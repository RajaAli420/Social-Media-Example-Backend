const express = require("express");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const {
  createPost,
  getSinglePost,
  getAllPosts,
  editPost,
  deletePost,
} = require("../controllers/post.controller");
const postRouter = express.Router();

postRouter.route("/").post(createPost).get(getAllPosts);
postRouter.route("/:id").get(getSinglePost).patch(editPost).delete(deletePost);
module.exports = postRouter;

const express = require("express");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const {
  createPost,
  getPost,
  editPost,
  deletePost,
} = require("../controllers/post.controller");
const postRouter = express.Router();

postRouter.post("/newpost", verifyUserCredentials, createPost);
postRouter.route("/:id").get(getPost).patch(editPost).delete(deletePost);
module.exports = postRouter;

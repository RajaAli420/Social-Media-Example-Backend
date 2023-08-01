const express = require("express");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const {
  createPost,
  getPost,
  editPost,
} = require("../controllers/post.controller");
const postRouter = express.Router();

postRouter.post("/newpost", verifyUserCredentials, createPost);
postRouter.route("/:id").get(getPost).patch(editPost);
module.exports = postRouter;

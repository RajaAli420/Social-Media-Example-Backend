const express = require("express");
const {
  createComment,
  getComment,
} = require("../controllers/comment.controller");
const commentRouter = express.Router();
commentRouter.route("/").post(createComment);
commentRouter.route("/:id").get(getComment);
module.exports = commentRouter;

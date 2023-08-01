const express = require("express");
const createComment = require("../controllers/comment.controller");
const commentRouter = express.Router();
commentRouter.route("/").post(createComment);
module.exports = commentRouter;

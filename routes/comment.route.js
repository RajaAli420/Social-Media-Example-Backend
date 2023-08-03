const express = require("express");
const {
  createComment,
  getComment,
  getAllCommentsPopulateMethod,
  getAllCommentsAggregateMethod,
} = require("../controllers/comment.controller");
const commentRouter = express.Router();
commentRouter.route("/").post(createComment).get(getAllCommentsPopulateMethod);
commentRouter.get("/aggregate", getAllCommentsAggregateMethod);
// commentRouter.get("/search", getAllComments);
commentRouter.route("/:id").get(getComment);
module.exports = commentRouter;

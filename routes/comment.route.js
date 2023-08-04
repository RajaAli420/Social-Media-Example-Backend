const express = require("express");
const {
  createComment,
  updateComment,
  getAllCommentsPopulateMethod,
  getAllCommentsAggregateMethod,
} = require("../controllers/comment.controller");
const commentRouter = express.Router();
commentRouter.route("/").post(createComment).get(getAllCommentsPopulateMethod);
commentRouter.get("/aggregate", getAllCommentsAggregateMethod);
// commentRouter.get("/search", getAllComments);
commentRouter.route("/:id").patch(updateComment);
module.exports = commentRouter;

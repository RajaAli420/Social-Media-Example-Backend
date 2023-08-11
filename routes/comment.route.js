const express = require("express");
const {
  createComment,
  updateComment,
  getAllCommentsPopulateMethod,
  getAllCommentsAggregateMethod,
} = require("../controllers/comment.controller");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const commentRouter = express.Router();
commentRouter
  .route("/")
  .post(verifyUserCredentials, createComment)
  .get(getAllCommentsPopulateMethod);
commentRouter.get("/aggregate", getAllCommentsAggregateMethod);
// commentRouter.get("/search", getAllComments);
commentRouter.route("/:id").patch(updateComment);
module.exports = commentRouter;

const express = require("express");
const {
  likePost,
  getAllLikesData,
} = require("../controllers/likes.controller");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const likeRouter = express.Router();
likeRouter
  .route("/")
  .post(verifyUserCredentials, likePost)
  .get(getAllLikesData);
module.exports = likeRouter;

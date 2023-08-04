const express = require("express");
const {
  likePost,
  getAllLikesData,
} = require("../controllers/likes.controller");
const likeRouter = express.Router();
likeRouter.route("/").post(likePost).get(getAllLikesData);
module.exports = likeRouter;

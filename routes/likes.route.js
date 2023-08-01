const express = require("express");
const likePost = require("../controllers/likes.controller");
const likeRouter = express.Router();
likeRouter.route("/").post(likePost);
module.exports = likeRouter;

require("dotenv").config();
require("express-async-errors");
const path = require("path");
const express = require("express");
const connectDB = require("./db/connect");
const userRouter = require("./routes/user.route");
const errorHandlerMiddleware = require("./middlewares/error-handler.middleware");
const authRouter = require("./routes/auth.route");
const postRouter = require("./routes/post.route");
const likeRouter = require("./routes/likes.route");
const commentRouter = require("./routes/comment.route");
const morgan = require("morgan");

const server = express();

server.use(express.json());

server.use(
  "/uploads/profilepictures",
  express.static(path.join(__dirname, "./uploads/profilepictures"))
);

server.use(
  "/uploads/commentimages",
  express.static(path.join(__dirname, "./uploads/commentimages"))
);

server.use(
  "/uploads/postimages",
  express.static(path.join(__dirname, "./uploads/postimages"))
);
server.use(morgan("dev"));
server.use("/api/user", userRouter);
server.use("/api/auth/", authRouter);
server.use("/api/post", postRouter);
server.use("/api/like/", likeRouter);
server.use("/api/comment/", commentRouter);
// server.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT, () =>
      console.log(`Server is listening on port ${process.env.PORT}...`)
    );
  } catch (err) {
    console.log(err);
  }
};
start();

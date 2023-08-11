require("dotenv").config();
require("express-async-errors");
const path = require("path");
const express = require("express");
const connectDB = require("./db/connect");
const userRouter = require("./routes/user.route");
const errorHandlerMiddleware = require("./middlewares/error-handler.middleware");
const authRouter = require("./routes/auth.route");
const cors = require("cors");
const http = require("http");
const postRouter = require("./routes/post.route");
const likeRouter = require("./routes/likes.route");
const commentRouter = require("./routes/comment.route");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { Server } = require("socket.io");
const likes = require("./models/likes");

const { allCommentsOnAPostEvent, newTry } = require("./event-Helper");

const server = express();
const app = http.createServer(server);
const io = new Server(app, {
  cors: {
    origin: ["http://localhost:4200"],
  },
});

server.use(helmet({ crossOriginResourcePolicy: false }));
server.use(express.json());
server.use(mongoSanitize());
server.use(
  cors({
    origin: ["http://localhost:4200"],
  })
);
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("like", async (post) => {
    console.log("WOW GRAPES", post);
    totalLikes = await likes.find({ post_id: post, liked: true }).count();
    console.log(totalLikes);
    socket.emit("UpdatedLike", { totalLikes });
  });

  socket.on("newComment", async (_comment) => {
    console.log(_comment);
    var newComment = await newTry(
      _comment.post_id,
      _comment.user_id,
      _comment.comment_id
    );
    console.log(newComment);
    socket.emit("addComment", newComment);
  });
});
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
server.use(express.urlencoded({ extended: false }));

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(process.env.PORT, () =>
      console.log(`Server is listening on port ${process.env.PORT}...`)
    );
  } catch (err) {
    console.log(err);
  }
};
start();

const { default: mongoose } = require("mongoose");
const CustomAPIError = require("../errors/custom.error");
const Likes = require("../models/likes");
const likePost = async (req, res) => {
  const like = await Likes.findOne({
    post_id: req.body.post_id,
    author: req.body.author,
  });
  if (!like) {
    let newLike = await Likes.create({
      post_id: req.body.post_id,
      author: req.body.author,
      liked: true,
    });
    if (!newLike) throw new CustomAPIError("Error in Liking", 500);
    res.status(200).json({ Msg: "Post Liked" });
  } else {
    let updateLike = await Likes.updateOne(
      { post_id: req.body.post_id, author: req.body.author },
      {
        liked: !like.liked,
      }
    );
    if (!updateLike) throw new CustomAPIError("Error in Liking", 500);
    res.status(200).json({ Msg: "Like Status Updated" });
  }
};

const getAllLikesData = async (req, res) => {
  const { post_id } = req.query;
  console.log(post_id);
  const likesData = await Likes.aggregate([
    {
      $match: {
        post_id: new mongoose.Types.ObjectId(post_id),
      },
    },
    {
      $match: {
        liked: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorInfo",
      },
    },
    { $unwind: "$authorInfo" },
    {
      $lookup: {
        from: "userprofiles",
        localField: "authorInfo._id",
        foreignField: "user",
        as: "authorInfo.userProfile",
      },
    },
    {
      $project: {
        _id: 0,
        liked: 1,
        // authorInfo: {
        name: "$authorInfo.name",
        profilePicture: {
          $arrayElemAt: ["$authorInfo.userProfile.profilePicture", 0],
        },
        // },
      },
    },
  ]);
  res.status(200).json(likesData);
};

module.exports = { likePost, getAllLikesData };

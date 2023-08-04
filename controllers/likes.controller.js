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

module.exports = likePost;

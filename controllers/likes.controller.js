const Likes = require("../models/likes");
const likePost = async (req, res) => {
  //   const { post_id } = req.params;
  console.log(req.body);
  const like = await Likes.findOne({
    post_id: req.body.post_id,
    author: req.body.author,
  });
  if (!like) {
    const newLike = await new Likes({
      post_id: req.body.post_id,
      author: req.body.author,
      liked: true,
    });

    res.status(200).json({ Msg: "Post Liked" });
  } else {
    const updateLikedStatus = await Likes.updateOne(
      { post_id: req.body.post_id, author: req.body.author },
      {
        liked: !like.liked,
      }
    );
    res.status(200).json({ Msg: "Like Status Updated" });
  }
};

module.exports = likePost;

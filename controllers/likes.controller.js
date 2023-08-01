const Likes = require("../models/likes");
const likePost = async (req, res) => {
  //   const { post_id } = req.params;
  console.log(req.body);
  const like = await Likes.create({
    post_id: req.body.post_id,
    liked: true,
    author: req.body.author,
    total_likes: +1,
  });
  res.status(200).send(like);
};

module.exports = likePost;

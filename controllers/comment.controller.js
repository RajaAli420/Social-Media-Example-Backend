const Comment = require("../models/comment");
const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      comment_content: req.body.comment_content,
      post_id: req.body.post_id,
      author: req.body.user_id,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json(err);
  }
};
module.exports = createComment;

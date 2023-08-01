const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom.error");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (!user) throw new CustomAPIError("User Not Found", StatusCodes.NOT_FOUND);
  if (user.password !== password)
    throw new CustomAPIError("Paswords do not match", StatusCodes.UNAUTHORIZED);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(StatusCodes.OK).json({ token: token });
};
//forgot and reset password later
module.exports = login;

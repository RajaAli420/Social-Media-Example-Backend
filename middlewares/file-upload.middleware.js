const multer = require("multer");
const CustomAPIError = require("../errors/custom.error");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilepicture") {
      cb(null, "./uploads/profilepictures");
    } else if (file.fieldname === "postimage") {
      cb(null, "./uploads/postimages/");
    } else if (file.fieldname === "commentimage") {
      cb(null, "./uploads/commentimages/");
    } else {
      cb(null, "../uploads/");
    }
  },
  filename: function (req, file, cb) {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/jpg")
      throw new CustomAPIError("File Not Support", 500);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({ storage: storage });

module.exports = upload;

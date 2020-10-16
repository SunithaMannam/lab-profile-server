const { v2: cloudinary } = require("cloudinary");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
// cloudinary.config({
//   cloud_name: "dqnzc4mlz",
//   api_key: "169187642165966",
//   api_secret:"jjqk-F5Nmm5CiwaIfqAOr7x3-gY",
// });
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "iron-hack-profile-pictures",
    allowed_formats: ["jpg", "png"],
  },
});

module.exports = multer({ storage });

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Add a unique suffix to the original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024 // 1 Gigabyte
  }
});
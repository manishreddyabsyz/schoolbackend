const multer=require("multer")
const storage = multer.memoryStorage();
const csvFileUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(new Error("No files found. please select one"));
      } else {
        if (file.mimetype === "text/csv") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error("Only .csv format allowed!"));
        }
      }
    },
  });

  module.exports={csvFileUpload};
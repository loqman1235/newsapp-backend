import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { ValidationError } from "../errors/ValidationError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + suffix + "." + ext);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(
      new ValidationError("Validation failed", [
        {
          field: "thumbnail",
          message: "Only PNG, JPG and JPEG files are allowed",
        },
      ])
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB size limit
});

export default upload;

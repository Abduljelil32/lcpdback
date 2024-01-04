/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prettier/prettier */

import { v2 as cloudinary } from "cloudinary";
import toStream = require("buffer-to-stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = (
  buffer: Buffer,
  resource_type: "image" | "video" | "raw" | "auto" = "image",
) => {
  if (!buffer) return null;
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      // { folder: "reon" },
      { resource_type },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    toStream(buffer).pipe(upload);
  });
};

export const deleteFile = (
  public_id: string,
  resource_type: string = "image",
) => {
  if (!public_id) return null;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      public_id,
      { resource_type },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
  });
};

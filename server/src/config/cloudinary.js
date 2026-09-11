import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export const uploadImage = (
  buffer,
  folder = process.env.CLOUDINARY_FOLDER ?? "lost-and-found",
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", overwrite: false },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    bufferToStream(buffer).pipe(stream);
  });
};

export const uploadImages = async (buffers, folder) => {
  const uploads = buffers.map((b) => uploadImage(b, folder));
  return Promise.all(uploads);
};

export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;

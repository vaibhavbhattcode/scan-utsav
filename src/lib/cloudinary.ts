import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || "scanutsav-demo";
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return { cloud_name, api_key, api_secret };
}

export { cloudinary };

export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "scanutsav_events",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ secureUrl: string; bytes: number; publicId: string; resourceType: string }> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          secureUrl: result.secure_url,
          bytes: result.bytes,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    if (Buffer.isBuffer(fileBuffer)) {
      uploadStream.end(fileBuffer);
    } else {
      cloudinary.uploader.upload(
        fileBuffer,
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary String Upload Error:", error);
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            secureUrl: result.secure_url,
            bytes: result.bytes,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        }
      );
    }
  });
}

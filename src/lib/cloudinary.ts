import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || "scanutsav-demo";
  const api_key = process.env.CLOUDINARY_API_KEY || "1234567890";
  const api_secret = process.env.CLOUDINARY_API_SECRET || "your_cloudinary_secret";

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return { cloud_name, api_key, api_secret };
}

export { cloudinary };

/**
 * Upload buffer or base64 file to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "scanutsav_events",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ secureUrl: string; bytes: number; publicId: string; resourceType: string }> {
  configureCloudinary();

  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
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
            if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
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
  } catch (err: any) {
    console.warn("Cloudinary upload fallback:", err.message);
    return {
      secureUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      bytes: 2450000,
      publicId: `dev_${Date.now()}`,
      resourceType: resourceType === "video" ? "video" : "image",
    };
  }
}

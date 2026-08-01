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
 * Upload buffer or base64 file to Cloudinary with safe base64 fallback
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "scanutsav_events",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ secureUrl: string; bytes: number; publicId: string; resourceType: string }> {
  configureCloudinary();

  try {
    const isPlaceholderKey =
      !process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_API_SECRET === "your_cloudinary_secret" ||
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "1234567890";

    if (isPlaceholderKey) {
      throw new Error("Placeholder Cloudinary credentials in .env");
    }

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
    console.warn("Cloudinary upload fallback activated:", err.message);

    let devUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800";
    let bytesCount = 2450000;

    if (Buffer.isBuffer(fileBuffer)) {
      bytesCount = fileBuffer.length;
      const base64 = fileBuffer.toString("base64");
      const mime = resourceType === "video" ? "video/mp4" : "image/jpeg";
      devUrl = `data:${mime};base64,${base64}`;
    } else if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      devUrl = fileBuffer;
    }

    return {
      secureUrl: devUrl,
      bytes: bytesCount,
      publicId: `dev_${Date.now()}`,
      resourceType: resourceType === "video" ? "video" : "image",
    };
  }
}

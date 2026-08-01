import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

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
 * Check if Cloudinary credentials are real (not placeholder)
 */
function hasRealCloudinaryKeys(): boolean {
  const secret = process.env.CLOUDINARY_API_SECRET;
  const key = process.env.CLOUDINARY_API_KEY;
  return !!(
    secret &&
    secret !== "your_cloudinary_secret" &&
    key &&
    key !== "1234567890"
  );
}

/**
 * Save file locally to /public/uploads/ for dev mode (fast, no base64)
 */
function saveFileLocally(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "auto"
): { secureUrl: string; bytes: number; publicId: string; resourceType: string } {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = resourceType === "video" ? "mp4" : "jpg";
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  return {
    secureUrl: `/uploads/${folder}/${filename}`,
    bytes: buffer.length,
    publicId: `local_${Date.now()}`,
    resourceType: resourceType === "video" ? "video" : "image",
  };
}

/**
 * Upload buffer to Cloudinary (production) or save locally (dev fallback)
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "scanutsav_events",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ secureUrl: string; bytes: number; publicId: string; resourceType: string }> {
  configureCloudinary();

  // If Cloudinary keys are real, upload to Cloudinary CDN
  if (hasRealCloudinaryKeys()) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
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
      console.warn("Cloudinary upload failed, falling back to local:", err.message);
    }
  }

  // Dev fallback: save to local /public/uploads/ (FAST, no base64!)
  if (Buffer.isBuffer(fileBuffer)) {
    return saveFileLocally(fileBuffer, folder, resourceType === "auto" ? "image" : resourceType);
  }

  // String input fallback
  return {
    secureUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    bytes: 2450000,
    publicId: `dev_${Date.now()}`,
    resourceType: resourceType === "video" ? "video" : "image",
  };
}

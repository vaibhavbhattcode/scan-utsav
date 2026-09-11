import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  return { cloud_name, api_key, api_secret };
}

export function configureCloudinary() {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return { cloud_name, api_key, api_secret };
}

export { cloudinary };

/** Signed params so browsers can upload directly to Cloudinary (no file proxy via Next.js). */
export function getSignedUploadParams(
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
) {
  const { cloud_name, api_key, api_secret } = configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  // Only params that will be sent in the upload request (besides file/api_key/resource_type)
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, api_secret);

  return {
    cloudName: cloud_name,
    apiKey: api_key,
    timestamp,
    signature,
    folder,
    resourceType,
  };
}

export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "scanutsav_events",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ secureUrl: string; bytes: number; publicId: string; resourceType: string }> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(fileBuffer)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary Stream Upload Error:", error);
            return reject(error || new Error("Cloudinary stream upload failed"));
          }
          resolve({
            secureUrl: result.secure_url,
            bytes: result.bytes,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        }
      );
      uploadStream.end(fileBuffer);
      return;
    }

    cloudinary.uploader.upload(
      fileBuffer,
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary File Upload Error:", error);
          return reject(error || new Error("Cloudinary file upload failed"));
        }
        resolve({
          secureUrl: result.secure_url,
          bytes: result.bytes,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );
  });
}

/** Verify a Cloudinary delivery URL belongs to our cloud (basic anti-spoof for media save). */
export function isTrustedCloudinaryUrl(url: string): boolean {
  try {
    const { cloud_name } = getCloudinaryConfig();
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloud_name}/`)
    );
  } catch {
    return false;
  }
}

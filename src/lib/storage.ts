import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || "https://s3.amazonaws.com";
const STORAGE_REGION = process.env.STORAGE_REGION || "us-east-1";
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || "scanutsav-media";
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || "demo_access_key";
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY || "demo_secret_key";
const STORAGE_PUBLIC_CDN_URL = process.env.STORAGE_PUBLIC_CDN_URL || "https://cdn.scanutsav.com";

export const s3Client = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  region: STORAGE_REGION,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

export async function getUploadPresignedUrl(
  fileName: string,
  contentType: string,
  eventCode: string
): Promise<{ presignedUrl: string; cdnUrl: string; key: string }> {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `events/${eventCode}/${Date.now()}_${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  const cdnUrl = `${STORAGE_PUBLIC_CDN_URL}/${key}`;

  return { presignedUrl, cdnUrl, key };
}

export async function deleteStorageObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

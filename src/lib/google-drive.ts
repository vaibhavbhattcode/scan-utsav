import { google } from "googleapis";
import { logger } from "./logger";

export interface GoogleDriveExportResult {
  success: boolean;
  folderUrl?: string;
  exportedCount?: number;
  error?: string;
}

// Ensure you have these environment variables set in production:
// GOOGLE_DRIVE_CLIENT_EMAIL
// GOOGLE_DRIVE_PRIVATE_KEY
// They come from a Google Cloud Service Account JSON key file.

function getDriveClient() {
  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
    throw new Error("Google Drive credentials not configured.");
  }
  
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function exportEventToGoogleDrive(
  eventId: string,
  eventTitle: string,
  mediaItems: Array<{ mediaUrl: string; uploaderName: string }>,
  userPlan: string,
  hostEmail: string
): Promise<GoogleDriveExportResult> {
  if (["trial", "lite", "standard"].includes(userPlan)) {
    return {
      success: false,
      error: "Google Drive Automated Export is available exclusively on Celebration Premium, Ultimate, and Agency plans. Upgrade your event to unlock!",
    };
  }

  try {
    const drive = getDriveClient();
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9 _-]/g, "");
    
    // 1. Create Folder
    const folderMetadata = {
      name: `ScanUtsav Export: ${sanitizedTitle}`,
      mimeType: "application/vnd.google-apps.folder",
    };
    
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, webViewLink",
    });
    
    const folderId = folder.data.id!;
    
    // 2. Share Folder with the Host
    if (hostEmail) {
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: hostEmail,
        },
      });
    }

    // 3. Upload files (We will need to fetch from mediaUrl and upload to drive)
    // Note: This can be a very long operation if there are hundreds of photos.
    // In a real production system, this should be handled by a background worker queue (like BullMQ).
    // For now, we will do a best-effort upload with a concurrency limit.
    
    let exportedCount = 0;
    
    for (const item of mediaItems) {
       try {
         const response = await fetch(item.mediaUrl);
         if (!response.ok) continue;
         
         const arrayBuffer = await response.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         
         const extension = item.mediaUrl.split('.').pop()?.split('?')[0] || 'jpg';
         const fileName = `${item.uploaderName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${extension}`;
         
         const media = {
           mimeType: response.headers.get('content-type') || 'image/jpeg',
           body: require('stream').Readable.from(buffer),
         };
         
         await drive.files.create({
           requestBody: {
             name: fileName,
             parents: [folderId],
           },
           media: media,
           fields: "id",
         });
         
         exportedCount++;
       } catch (err) {
         logger.error(`Failed to export file to drive: ${item.mediaUrl}`, err);
       }
    }

    return {
      success: true,
      folderUrl: folder.data.webViewLink || `https://drive.google.com/drive/folders/${folderId}`,
      exportedCount,
    };
  } catch (err: any) {
    logger.error("Google Drive Export Error", err);
    return {
      success: false,
      error: err.message || "Failed to export album to Google Drive",
    };
  }
}

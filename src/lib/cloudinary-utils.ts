/**
 * Cloudinary URL Transformation & Optimization Helper
 * Automatically injects f_auto, q_auto, and width scaling for 10x faster thumbnail delivery.
 */

export function getOptimizedThumbnailUrl(url: string, width: number = 600): string {
  if (!url || typeof url !== "string") return url;

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const transform = `f_auto,q_auto,w_${width},c_limit`;
    return url.replace("/upload/", `/upload/${transform}/`);
  }

  return url;
}

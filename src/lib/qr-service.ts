import QRCode from "qrcode";

export interface QROptions {
  colorDark?: string;
  colorLight?: string;
  width?: number;
  margin?: number;
}

export async function generateQRCodeDataUrl(text: string, options?: QROptions): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      width: options?.width || 400,
      margin: options?.margin || 2,
      color: {
        dark: options?.colorDark || "#ff5429",
        light: options?.colorLight || "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
    return url;
  } catch (err) {
    console.error("QR Generation Error:", err);
    throw err;
  }
}

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

export async function generateQRCodeSvgString(text: string, options?: QROptions): Promise<string> {
  try {
    const svg = await QRCode.toString(text, {
      type: "svg",
      width: options?.width || 400,
      margin: options?.margin || 2,
      color: {
        dark: options?.colorDark || "#F2810C",
        light: options?.colorLight || "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
    return svg;
  } catch (err) {
    console.error("QR SVG Generation Error:", err);
    throw err;
  }
}

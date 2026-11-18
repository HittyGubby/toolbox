import QRCode from "qrcode";
import jsQR from "jsqr";

export interface QrStyle {
  size: number;
  dark: string;
  light: string;
  format: "png" | "svg";
}

/** 生成二维码，返回可直接放进 <img src> 的 data URL */
export async function renderQr(text: string, s: QrStyle): Promise<string> {
  if (s.format === "svg") {
    const svg = await QRCode.toString(text, {
      type: "svg",
      width: s.size,
      color: { dark: s.dark, light: s.light },
      margin: 2,
    });
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  return QRCode.toDataURL(text, {
    width: s.size,
    color: { dark: s.dark, light: s.light },
    margin: 2,
  });
}

/** 从位图中识别二维码，返回其中的文本 */
export function scanQr(image: ImageData): string {
  const res = jsQR(image.data, image.width, image.height, {
    inversionAttempts: "attemptBoth",
  });
  if (!res) throw new Error("未识别到二维码，换一张更清晰的图片试试");
  return res.data;
}

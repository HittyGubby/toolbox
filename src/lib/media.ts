/** 把图片 URL 解码为位图，超过 maxSide 时等比缩小，供各类图像工具复用 */
export async function decodeImage(
  url: string,
  maxSide = 1600,
): Promise<ImageData> {
  const img = new Image();
  img.src = url;
  await img.decode();

  const scale = Math.min(
    1,
    maxSide / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("无法读取图片像素");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

import { decodeImage } from "../media";

export interface ImageSource {
  url: string;
  image: ImageData;
  release(): void;
}

/** 把一个 File 变成可显示、可解码、且能显式释放的图片源 */
export async function loadImageSource(file: File): Promise<ImageSource> {
  const url = URL.createObjectURL(file);
  try {
    const image = await decodeImage(url);
    return {
      url,
      image,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

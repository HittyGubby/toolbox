/** 剪贴板与图片文件相关的平台细节，全部收敛在这里 */

function isImage(type: string): boolean {
  return !!type && type.startsWith("image/");
}

/**
 * 从 paste / drop 的 DataTransfer 里取出图片文件。
 *
 * 顺序与判据都很重要：
 *  1. files —— 规范路径；
 *  2. items —— 不看 DataTransferItem.kind；
 *  3. items 的 type 也不可信：Firefox 遇到「同一个剪贴板条目同时带 text/html
 *     和 image/png」时，会把 type 报成 text/html，此时 getAsFile() 仍可能给出
 *     图片文件，所以一律先调 getAsFile()，再按返回文件自身的 type 判断。
 */
export function imageFilesFrom(dt: DataTransfer | null | undefined): File[] {
  if (!dt) return [];

  const out: File[] = [];
  for (const f of Array.from(dt.files ?? [])) {
    if (isImage(f.type)) out.push(f);
  }
  if (out.length) return out;

  for (const item of Array.from(dt.items ?? [])) {
    let file: File | null = null;
    try {
      file = item.getAsFile();
    } catch {
      file = null;
    }
    if (file && (!file.type || isImage(file.type))) out.push(file);
  }
  return out;
}

/** 把结果写进剪贴板：图片走 ClipboardItem，文本走 writeText，不支持时降级 */
export async function writeToClipboard(output: string): Promise<void> {
  if (!output.startsWith("data:image")) {
    await navigator.clipboard.writeText(output);
    return;
  }
  const blob = await (await fetch(output)).blob();
  const Item = globalThis.ClipboardItem;
  if (!Item || !navigator.clipboard?.write) {
    await navigator.clipboard.writeText(output);
    return;
  }
  await navigator.clipboard.write([new Item({ [blob.type]: blob })]);
}

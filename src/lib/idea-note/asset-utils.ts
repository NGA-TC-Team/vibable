// 이미지 자동 리사이즈 + 썸네일 생성
//
// 원본이 > MAX_LONGEST_SIDE px이면 Canvas 2D로 다운샘플하여 원본을 교체한다.
// 별도 THUMBNAIL_LONGEST_SIDE px 썸네일을 만들어 두 개를 반환한다.

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_LONGEST_SIDE = 2000;
export const THUMBNAIL_LONGEST_SIDE = 320;

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

export async function loadImageDimensions(
  blob: Blob,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function resizeToCanvas(
  blob: Blob,
  longestSide: number,
  mimeHint?: string,
): Promise<ResizedImage> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const ratio = Math.min(
      1,
      longestSide / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const w = Math.round(img.naturalWidth * ratio);
    const h = Math.round(img.naturalHeight * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context 획득 실패");
    ctx.drawImage(img, 0, 0, w, h);

    const outMime =
      mimeHint ?? (blob.type === "image/png" ? "image/png" : "image/jpeg");
    const outBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))),
        outMime,
        outMime === "image/jpeg" ? 0.9 : undefined,
      );
    });
    return { blob: outBlob, width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImageForStorage(blob: Blob): Promise<{
  main: ResizedImage;
  thumb: ResizedImage;
}> {
  const dims = await loadImageDimensions(blob);
  const needsResize = Math.max(dims.width, dims.height) > MAX_LONGEST_SIDE;
  const main: ResizedImage = needsResize
    ? await resizeToCanvas(blob, MAX_LONGEST_SIDE)
    : { blob, width: dims.width, height: dims.height };
  const thumb = await resizeToCanvas(blob, THUMBNAIL_LONGEST_SIDE, "image/jpeg");
  return { main, thumb };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isImageBlob(blob: Blob): boolean {
  return blob.type.startsWith("image/");
}

export function isVideoBlob(blob: Blob): boolean {
  return blob.type.startsWith("video/");
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Renders a pixel crop of `imageSrc` to a canvas and returns it as a File.
 * `round: true` clips the output to a circle (transparent corners) — used for the "circle" shape.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  options: { round?: boolean; fileName?: string; mimeType?: "image/png" | "image/jpeg" } = {},
): Promise<{ file: File; previewUrl: string }> {
  const { round = false, fileName = "cropped.png", mimeType = "image/png" } = options;
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  if (round) {
    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  if (round) ctx.restore();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      mimeType,
      0.92,
    );
  });

  return {
    file: new File([blob], fileName, { type: mimeType }),
    previewUrl: URL.createObjectURL(blob),
  };
}

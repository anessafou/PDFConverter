export async function encodeCanvas(canvas: HTMLCanvasElement, extension: string): Promise<Blob> {
  if (extension === 'bmp') {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable.');
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const stride = Math.ceil(width * 3 / 4) * 4;
    const buffer = new ArrayBuffer(54 + stride * height);
    const view = new DataView(buffer);
    view.setUint16(0, 0x4d42, true);
    view.setUint32(2, buffer.byteLength, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(34, stride * height, true);
    const bytes = new Uint8Array(buffer, 54);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const source = ((height - y - 1) * width + x) * 4;
      const target = y * stride + x * 3;
      bytes[target] = pixels[source + 2]; bytes[target + 1] = pixels[source + 1]; bytes[target + 2] = pixels[source];
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }
  const mime = ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' } as Record<string, string>)[extension];
  if (!mime) throw new Error('This image output requires the conversion service.');
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mime, 0.92));
  if (!blob || blob.type !== mime) throw new Error('Your browser cannot encode ' + extension.toUpperCase() + '. Choose PNG, JPG, or WebP.');
  return blob;
}

export async function loadImageCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Your browser cannot decode this image format.'));
      img.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40_000_000) {
      throw new Error('Image dimensions exceed the 40 megapixel limit.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable.');
    ctx.drawImage(img, 0, 0);
    return canvas;
  } finally { URL.revokeObjectURL(url); }
}

const CSS_PIXELS_PER_MILLIMETER = 96 / 25.4;

export interface PreviewScale {
  readonly scale: number;
  readonly width: number;
  readonly height: number;
}

export function millimetersToCssPixels(millimeters: number): number {
  return millimeters * CSS_PIXELS_PER_MILLIMETER;
}

export function calculatePreviewScale(
  availableWidth: number,
  pageWidth: number,
  pageHeight: number,
): PreviewScale {
  const scale = Math.min(1, availableWidth / pageWidth);

  return {
    scale,
    width: pageWidth * scale,
    height: pageHeight * scale,
  };
}

export type OutputFormat = 'ico' | 'pwa' | 'both';

export interface ConversionOptions {
  outputFormat: OutputFormat;
  outputDir: string;
  icoSizes?: number[];
}

export interface ConversionResult {
  icoPath?: string;
  pwaPaths?: string[];
  success: boolean;
  error?: string;
}

export const PWA_ICON_SIZES = [16, 32, 48, 64, 128, 192, 512] as const;


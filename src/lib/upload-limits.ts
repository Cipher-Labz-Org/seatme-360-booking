/** Keep in sync with backend MAX_UPLOAD_MB (default 100) */
export const MAX_PANORAMA_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 100);
export const MAX_PANORAMA_UPLOAD_BYTES = MAX_PANORAMA_UPLOAD_MB * 1024 * 1024;

export function formatMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

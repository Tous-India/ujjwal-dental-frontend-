/**
 * Robust cross-platform file download.
 *
 * iOS Safari often ignores the `download` attribute (and plain
 * window.open navigation) for cross-origin URLs like Cloudinary-hosted
 * files -- it either does nothing or just opens/navigates to the file
 * instead of saving it. Fetching the file into a blob first and triggering
 * the download from an object URL (same-origin, in-memory) is far more
 * reliable across Windows/Android/iOS than relying on the browser to
 * interpret download intent for an external URL.
 *
 * Falls back to opening the URL in a new tab (iOS's native PDF/image
 * viewer has its own Share/Save button -- the standard iOS-friendly
 * fallback) if the fetch/blob approach fails for any reason (CORS,
 * network, etc).
 *
 * @param {string} url - File URL to fetch.
 * @param {string} filename - Suggested filename for the saved file.
 * @param {RequestInit} [options] - Optional extra fetch options (e.g. `headers`
 *   with an Authorization bearer token for authenticated API endpoints like
 *   report/patient exports, as opposed to public Cloudinary URLs).
 */
export async function downloadFile(url, filename = "download", options = {}) {
  if (!url) return;
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

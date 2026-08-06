/**
 * Direct browser -> Cloudinary upload.
 *
 * WHY: the API runs as a Vercel serverless function, which enforces a HARD
 * ~4.5MB request body limit that cannot be raised from application code.
 * Report uploads used to stream the file THROUGH the API, so every byte
 * counted against that ceiling. Phone camera photos are routinely 3-12MB, so
 * they were rejected by the platform before our code ever ran -- while
 * sub-2MB desktop files sailed through. That is the entire "works on desktop,
 * fails on every phone" bug.
 *
 * The limit was also CUMULATIVE: the report endpoint accepts up to 10 files in
 * one request, so even a few mid-size files together could breach it.
 *
 * Now the browser uploads each file straight to Cloudinary with a short-lived
 * signature minted by our backend, and only the resulting metadata (a few
 * hundred bytes) is posted to us. Nothing large touches the function, so
 * neither the per-file nor the cumulative limit applies.
 *
 * Uploads are SIGNED, never unsigned -- an unsigned preset would let anyone on
 * the internet write into the Cloudinary account. The signature is obtained
 * from an authenticated endpoint and pins the folder server-side.
 */
import { getUploadSignature } from "../api/admin/uploads.api";

const CLOUDINARY_UPLOAD_URL = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

/**
 * Upload one file directly to Cloudinary.
 *
 * XMLHttpRequest rather than fetch(): fetch has no upload-progress event, and
 * an 8MB upload over mobile data takes real time -- without progress the UI
 * would look hung.
 *
 * @param {File} file
 * @param {object} signature - from getUploadSignature()
 * @param {(percent:number)=>void} [onProgress]
 * @returns {Promise<{url,publicId,fileName,fileSize,fileType,thumbnailUrl}>}
 */
const uploadOne = (file, signature, onProgress) =>
  new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", signature.timestamp);
    form.append("signature", signature.signature);
    // MUST match the folder that was signed, or Cloudinary rejects the upload.
    form.append("folder", signature.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_UPLOAD_URL(signature.cloudName));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        return reject(new Error("Unexpected response from the upload service"));
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(new Error(body?.error?.message || `Upload failed (${xhr.status})`));
      }

      resolve({
        url: body.secure_url,
        publicId: body.public_id,
        fileName: file.name,
        fileSize: file.size,
        // Cloudinary transcodes HEIC/HEIF on ingest, so report the delivered
        // format rather than the browser's original MIME type.
        fileType: body.resource_type === "image" ? `image/${body.format}` : file.type,
        thumbnailUrl:
          body.resource_type === "image"
            ? body.secure_url.replace("/upload/", "/upload/w_200,h_200,c_thumb/")
            : undefined,
      });
    };

    xhr.onerror = () =>
      reject(new Error("Network error while uploading. Please check your connection."));
    xhr.ontimeout = () => reject(new Error("The upload timed out. Please try again."));

    xhr.send(form);
  });

/**
 * Upload several files directly to Cloudinary, reporting per-file progress.
 *
 * One signature is minted and reused across the batch -- it is valid for a
 * window, not a single use, and re-requesting per file would just add
 * round-trips. Uploads run SEQUENTIALLY: parallel 8MB uploads on mobile data
 * contend for the same narrow uplink, making every file slower and progress
 * meaningless.
 *
 * @param {File[]} files
 * @param {(index:number, percent:number)=>void} [onFileProgress]
 * @returns {Promise<Array>} metadata for each uploaded file, in input order
 */
export const uploadFilesDirect = async (files, onFileProgress) => {
  const { data } = await getUploadSignature();

  const results = [];
  for (let i = 0; i < files.length; i++) {
    // Sequential is deliberate -- see the note above.
    const meta = await uploadOne(files[i], data, (pct) => onFileProgress?.(i, pct));
    results.push(meta);
  }
  return results;
};

export default uploadFilesDirect;

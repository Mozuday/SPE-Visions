import { supabase } from "./supabase";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type SignResponse = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  fields: Record<string, string>;
};

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
};

/*
 * supabase.functions.invoke hides the response body on errors.
 * This reads it, so the console shows what the function said.
 */
const readFunctionError = async (error: unknown): Promise<string> => {
  try {
    const response = (error as { context?: Response } | null)?.context;

    return response ? await response.text() : String(error);
  } catch {
    return String(error);
  }
};

/*
 * Ask the Edge Function for a signature, then upload straight
 * to Cloudinary. The API secret never reaches the browser.
 */
const upload = async (
  file: File,
  request: Record<string, string>
): Promise<CloudinaryResult> => {
  const { data, error } = await supabase.functions.invoke<SignResponse>(
    "cloudinary",
    { body: { action: "sign", ...request } }
  );

  if (error || !data) {
    console.error("Cloudinary function said:", await readFunctionError(error));
    throw new Error("Couldn't start the upload. Please try again.");
  }

  const form = new FormData();

  form.append("file", file);
  form.append("api_key", data.apiKey);
  form.append("timestamp", String(data.timestamp));
  form.append("signature", data.signature);

  Object.entries(data.fields).forEach(([key, value]) =>
    form.append(key, value)
  );

  const response = await fetch(data.uploadUrl, { method: "POST", body: form });

  if (!response.ok) {
    console.error("Cloudinary upload failed:", await response.text());
    throw new Error("The upload failed. Check the file and try again.");
  }

  return (await response.json()) as CloudinaryResult;
};

/*
 * Admin only. Returns a public, optimisable image URL.
 */
export const uploadImage = async (
  file: File,
  folder: "courses" | "blogs" | "portfolio" | "services" | "misc"
): Promise<string> => {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const result = await upload(file, { purpose: "image", folder });

  return result.secure_url;
};

/*
 * Anyone may upload. Returns the private public_id, which is
 * saved in the database. It is not a viewable URL.
 */
export const uploadResume = async (file: File): Promise<string> => {
  if (!RESUME_TYPES.includes(file.type)) {
    throw new Error("Please upload a PDF or Word document.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Resume must be 5 MB or smaller.");
  }

  const result = await upload(file, { purpose: "resume" });

  return result.public_id;
};

/*
 * Admin only. A download link that expires in 5 minutes.
 */
export const getResumeLink = async (publicId: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke<{ url: string }>(
    "cloudinary",
    { body: { action: "resume-link", publicId } }
  );

  if (error || !data?.url) {
    console.error("Cloudinary function said:", await readFunctionError(error));
    throw new Error("Couldn't open this resume.");
  }

  return data.url;
};

/*
 * Serve smaller, modern formats automatically. Leaves non-
 * Cloudinary URLs untouched.
 */
export const optimizeImage = (url: string | null, width?: number) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const transform = `f_auto,q_auto${width ? `,w_${width}` : ""}`;

  return url.replace("/upload/", `/upload/${transform}/`);
};
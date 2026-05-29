import { ElMessage } from "element-plus";
import { uploadCommonAttachment } from "@/api/attendance";

const MAX_ATTACHMENT_SIZE_MB = 20;

export function buildLeaveAttachmentAccessUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) {
    return "";
  }
  if (/^\/ipdoc(\/|$)/i.test(raw)) {
    return raw;
  }
  return `/ipdoc${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function beforeLeaveAttachmentUpload(file) {
  if (file.size / 1024 / 1024 > MAX_ATTACHMENT_SIZE_MB) {
    ElMessage.warning(`文件大小不能超过${MAX_ATTACHMENT_SIZE_MB}MB`);
    return false;
  }
  return true;
}

export async function uploadLeaveAttachment(options) {
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("bizType", "leave");
  try {
    const res = await uploadCommonAttachment(formData, { isLoading: false });
    const payload = res?.data || {};
    options.onSuccess?.({ data: payload }, options.file);
  } catch (error) {
    options.onError?.(error);
  }
}

export function handleLeaveAttachmentUploadSuccess(response, uploadFile) {
  const payload = response?.data || response || {};
  const attachmentId = payload?.attachmentId;
  const filePath = payload?.filePath || payload?.fileUrl;
  if (attachmentId !== undefined && attachmentId !== null && attachmentId !== "") {
    uploadFile.attachmentId = attachmentId;
  }
  if (filePath) {
    uploadFile.url = filePath;
    uploadFile.filePath = filePath;
  }
}

import { ApiError } from "./api";

const STATUS_MESSAGES: Record<number, string> = {
  413: "File too large for the server. Try a smaller file.",
  429: "Rate limit reached. Please wait a moment and try again.",
  408: "Analysis timed out. The server may be busy.",
  500: "Something went wrong on our end. Please try again.",
  502: "Something went wrong on our end. Please try again.",
  503: "Service temporarily unavailable. Please try again shortly.",
};

export function getUserErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Analysis timed out. The server may be busy.";
  }
  if (err instanceof TypeError) {
    return "Connection error. Check your network.";
  }
  if (err instanceof ApiError) {
    const mapped = STATUS_MESSAGES[err.status];
    if (mapped) return mapped;
    if (err.body?.error) return err.body.error;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Analysis failed";
}

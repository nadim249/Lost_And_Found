import toast from "react-hot-toast";

const TECHNICAL_PATTERNS = [
  "is not defined",
  "cannot read propert",
  "is not a function",
  "unexpected token",
  "network error",
  "failed to fetch",
  "econnrefused",
  "etimedout",
  "syntaxerror",
  "referenceerror",
  "typeerror",
  "rangeerror",
  "evalerror",
  "internal server error",
  "server error",
  "database error",
  "prismaclient",
  "uncaught",
  "null pointer",
];

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Sanitizes an error message or exception object so technical internals and raw
export function sanitizeErrorMessage(input) {
  if (!input) return GENERIC_ERROR;

  // Handle Error instances or Axios error objects
  if (typeof input === "object") {
    const status = input.response?.status;
    const serverMessage = input.response?.data?.message;

    // Preserve clean user-facing 4xx validation or business logic messages
    if (status && status < 500 && typeof serverMessage === "string") {
      return sanitizeErrorMessage(serverMessage);
    }

    if (typeof input.message === "string") {
      return sanitizeErrorMessage(input.message);
    }

    return GENERIC_ERROR;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return GENERIC_ERROR;

    const lower = trimmed.toLowerCase();
    if (TECHNICAL_PATTERNS.some((p) => lower.includes(p))) {
      return GENERIC_ERROR;
    }

    // Check for stack trace traces (e.g., at App.render (App.jsx:12:4))
    if (/\bat\s+[\w$./\\<>]+:\d+:\d+/i.test(trimmed) || /\bat\s+\w+\s+\(/i.test(trimmed)) {
      return GENERIC_ERROR;
    }

    return trimmed;
  }

  return GENERIC_ERROR;
}

const originalError = toast.error.bind(toast);

// Intercept toast.error globally across the entire client application
toast.error = (message, options) => {
  const sanitized = sanitizeErrorMessage(message);

  // Deduplicate generic error toasts so multiple simultaneous errors don't stack duplicates
  const finalOptions = { ...options };
  if (sanitized === GENERIC_ERROR && !finalOptions.id) {
    finalOptions.id = "global-generic-error";
  }

  return originalError(sanitized, finalOptions);
};

export default toast;

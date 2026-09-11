// Wrapper utility for Express route handlers to capture errors thrown in async methods
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


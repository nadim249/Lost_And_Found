// Sends a 200 OK JSON success response
export const ok = (res, data, message = "OK", meta) => {
  const payload = { success: true, message, data, meta };
  return res.status(200).json(payload);
};

// Sends a 201 Created JSON success response
export const created = (res, data, message = "Created") => {
  const payload = { success: true, message, data };
  return res.status(201).json(payload);
};

// Sends a non-2xx error JSON response
export const fail = (res, status, message, data) => {
  const payload = { success: false, message, data };
  return res.status(status).json(payload);
};


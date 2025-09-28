const MAX_POINTS = 300;

const clampMetricArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  if (values.length <= MAX_POINTS) {
    return values;
  }

  return values.slice(-MAX_POINTS);
};

const ingestHandler = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { dashboardData } = req.body || {};

  if (!dashboardData || typeof dashboardData !== "object") {
    res.status(400).json({ error: "Invalid payload: dashboardData is required" });
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(dashboardData).map(([key, values]) => [key, clampMetricArray(values)])
  );

  const io = globalThis.io || res.socket.server?.io;

  if (io) {
    io.emit("new-data", payload);
  }

  res.status(200).json({ status: "ok" });
};

export default ingestHandler;

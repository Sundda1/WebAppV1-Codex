import { NextResponse } from "next/server";

const METRIC_DESCRIPTORS = {
  gsr: "galvanic skin response",
  hr: "heart rate",
  hrv: "heart rate variability",
  temp: "temperature",
};

const toNumberArray = (values = []) =>
  values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

const buildMetricInsight = (key, values) => {
  const numericValues = toNumberArray(values);

  if (numericValues.length === 0) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  const average = total / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const latest = numericValues.at(-1);

  const descriptor = METRIC_DESCRIPTORS[key] ?? key;

  return `Average ${descriptor} is ${average.toFixed(2)} with a range of ${min.toFixed(2)}–${max.toFixed(
    2
  )}. Latest reading is ${latest?.toFixed(2)}.`;
};

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { dashboardData } = payload || {};

  if (!dashboardData || typeof dashboardData !== "object") {
    return NextResponse.json(
      { error: "dashboardData is required" },
      { status: 400 }
    );
  }

  const insights = Object.entries(dashboardData)
    .map(([key, values]) => buildMetricInsight(key, values))
    .filter(Boolean);

  if (insights.length === 0) {
    insights.push("No biometric samples were available to analyse.");
  }

  return NextResponse.json({ insights });
}

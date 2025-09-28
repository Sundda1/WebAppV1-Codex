"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import InsightsDisplay from "@/components/dashboard/InsightsDisplay";
import MetricCard from "@/components/dashboard/MetricCard";

const MAX_POINTS = 240;
const SOCKET_PATH = "/api/socket.io";

const DEFAULT_METRICS = {
  gsr: [],
  hr: [],
  hrv: [],
  temp: [],
};

const METRIC_LABELS = {
  gsr: "Galvanic Skin Response",
  hr: "Heart Rate",
  hrv: "Heart Rate Variability",
  temp: "Temperature",
};

const mergeMetricValues = (current = [], incoming = []) => {
  const normalizedIncoming = Array.isArray(incoming) ? incoming : [];
  const merged = [...current, ...normalizedIncoming];

  if (merged.length <= MAX_POINTS) {
    return merged;
  }

  return merged.slice(-MAX_POINTS);
};

export default function DashboardPage() {
  const socketRef = useRef();
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [isConnected, setIsConnected] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState(null);
  const [isRequestingInsights, setIsRequestingInsights] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialiseSocket = async () => {
      try {
        await fetch("/api/socket");
      } catch (error) {
        console.error("Failed to initialise socket server", error);
      }

      const socket = io({ path: SOCKET_PATH });
      socketRef.current = socket;

      socket.on("connect", () => {
        if (!isMounted) {
          return;
        }

        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        if (!isMounted) {
          return;
        }

        setIsConnected(false);
      });

      socket.on("new-data", (incomingData) => {
        if (!isMounted || !incomingData) {
          return;
        }

        setMetrics((previous) => ({
          gsr: mergeMetricValues(previous.gsr, incomingData.gsr),
          hr: mergeMetricValues(previous.hr, incomingData.hr),
          hrv: mergeMetricValues(previous.hrv, incomingData.hrv),
          temp: mergeMetricValues(previous.temp, incomingData.temp),
        }));
        setInsights(null);
        setInsightsError(null);
      });
    };

    initialiseSocket();

    return () => {
      isMounted = false;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
    };
  }, []);

  const currentValues = useMemo(
    () => ({
      gsr: metrics.gsr.at(-1) ?? null,
      hr: metrics.hr.at(-1) ?? null,
      hrv: metrics.hrv.at(-1) ?? null,
      temp: metrics.temp.at(-1) ?? null,
    }),
    [metrics]
  );

  const hasData = useMemo(
    () => Object.values(metrics).some((values) => values.length > 0),
    [metrics]
  );

  const requestInsights = async () => {
    if (!hasData) {
      return;
    }

    setIsRequestingInsights(true);
    setInsightsError(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardData: metrics }),
      });

      if (!response.ok) {
        throw new Error("The insights service responded with an error");
      }

      const payload = await response.json();
      setInsights(Array.isArray(payload.insights) ? payload.insights : []);
    } catch (error) {
      console.error("Failed to fetch insights", error);
      setInsightsError(
        error instanceof Error
          ? error.message
          : "We were unable to generate insights. Please try again."
      );
    } finally {
      setIsRequestingInsights(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Real-Time Biometric Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor galvanic skin response, heart rate, heart rate variability, and temperature in real time
              while AI keeps you informed with actionable summaries.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-slate-300"
              } animate-pulse`}
              aria-hidden
            />
            {isConnected ? "Live connection" : "Connecting to sensor feed…"}
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <MetricCard
              key={key}
              title={label}
              data={metrics[key]}
              currentValue={currentValues[key]}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI Session Insights</h2>
              <p className="mt-1 text-sm text-slate-500">
                Generate a Gemini-powered summary when your session wraps up to highlight noteworthy biometric trends.
              </p>
            </div>
            <button
              type="button"
              onClick={requestInsights}
              disabled={!hasData || isRequestingInsights}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isRequestingInsights ? "Generating…" : "Get Insights"}
            </button>
          </div>
        </section>

        <InsightsDisplay insights={insights} error={insightsError} />
      </div>
    </main>
  );
}

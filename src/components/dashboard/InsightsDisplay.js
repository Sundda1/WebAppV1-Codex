"use client";

const InsightsDisplay = ({ insights, error }) => {
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        <h3 className="text-lg font-semibold">Insights unavailable</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-emerald-500" aria-hidden />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsDisplay;

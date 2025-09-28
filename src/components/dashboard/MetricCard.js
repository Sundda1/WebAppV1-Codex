"use client";

import LiveChart from "@/components/dashboard/LiveChart";

const formatValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return Number(value).toFixed(2);
};

const MetricCard = ({ title, data = [], currentValue }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatValue(currentValue)}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Live
        </span>
      </div>
      <div className="mt-4 flex-1">
        <LiveChart data={data} />
      </div>
    </div>
  );
};

export default MetricCard;

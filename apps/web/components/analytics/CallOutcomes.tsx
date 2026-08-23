import React from 'react';

interface CallOutcomesProps {
  outcomes: {
    connected: number;
    notAnswered: number;
    busy: number;
    failed: number;
    voicemail: number;
  };
}

export function CallOutcomes({ outcomes }: CallOutcomesProps) {
  const total = outcomes.connected + outcomes.notAnswered + outcomes.busy + outcomes.failed + outcomes.voicemail;

  const getWidth = (val: number) => {
    if (total === 0) return 0;
    return (val / total) * 100;
  };

  const categories = [
    { label: 'Connected', value: outcomes.connected, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Not Answered', value: outcomes.notAnswered, color: 'bg-amber-400', text: 'text-amber-700' },
    { label: 'Busy', value: outcomes.busy, color: 'bg-orange-500', text: 'text-orange-700' },
    { label: 'Voicemail', value: outcomes.voicemail, color: 'bg-blue-400', text: 'text-blue-700' },
    { label: 'Failed', value: outcomes.failed, color: 'bg-rose-500', text: 'text-rose-700' },
  ].filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      {/* Visual Stacked Bar */}
      <div className="flex w-full h-4 rounded-full overflow-hidden mb-6 bg-default-100">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            style={{ width: `${getWidth(cat.value)}%` }}
            className={`h-full ${cat.color} transition-all duration-500 hover:opacity-80`}
            title={`${cat.label}: ${cat.value}`}
          />
        ))}
      </div>

      {/* Legend & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-default-50 border border-default-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
              <span className={`text-sm font-semibold ${cat.text}`}>{cat.label}</span>
            </div>
            <span className="text-sm font-bold text-default-900">{cat.value}</span>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-2 text-center py-4 text-sm font-medium text-default-400">
            No calls recorded in this period.
          </div>
        )}
      </div>
    </div>
  );
}

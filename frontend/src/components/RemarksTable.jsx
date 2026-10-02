import React from 'react';

const STATUS_BADGES = {
  OFF_DUTY: {
    label: 'Off Duty',
    bg: 'bg-slate-700/60 text-slate-200 border-slate-600',
  },
  SLEEPER_BERTH: {
    label: 'Sleeper Berth',
    bg: 'bg-indigo-900/60 text-indigo-200 border-indigo-700',
  },
  DRIVING: {
    label: 'Driving',
    bg: 'bg-blue-900/60 text-blue-200 border-blue-700',
  },
  ON_DUTY: {
    label: 'On Duty (Not Driving)',
    bg: 'bg-amber-900/60 text-amber-200 border-amber-700',
  },
};

export default function RemarksTable({ remarks }) {
  if (!remarks || remarks.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-200 print:border-slate-400">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 print:text-black">
          Record of Duty Status Remarks & Location Logs (§395.8)
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">
          {remarks.length} Event(s) Recorded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-slate-200 print:border-slate-800">
          <thead className="bg-slate-100 print:bg-slate-200 text-slate-700 print:text-black border-b border-slate-200">
            <tr>
              <th className="py-1.5 px-3 font-semibold w-16 font-mono">Time</th>
              <th className="py-1.5 px-3 font-semibold w-36">Duty Status</th>
              <th className="py-1.5 px-3 font-semibold w-48">Location</th>
              <th className="py-1.5 px-3 font-semibold">Operational Remark / Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-slate-300">
            {remarks.map((r, i) => {
              const badge = STATUS_BADGES[r.status] || STATUS_BADGES.OFF_DUTY;
              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 px-3 font-mono font-bold text-slate-900 print:text-black">
                    {r.time}
                  </td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg} print:border-black print:text-black print:bg-white`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 font-medium text-slate-800 print:text-black">
                    {r.location}
                  </td>
                  <td className="py-1.5 px-3 text-slate-600 print:text-black">
                    {r.remark}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

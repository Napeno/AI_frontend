import React from 'react';

/** Kết quả nghiên cứu phân loại mức độ đi tắt nhận thức (n = 47) — khớp bảng nguồn. */
export const HEURISTIC_STUDY = {
  n: 47,
  title: 'Phân loại mức độ đi tắt nhận thức trước và sau can thiệp (n = 47)',
  levels: [
    { key: 'high', label: 'Cao', before: 6, after: 0, color: '#ef4444' },
    { key: 'medium', label: 'Trung bình', before: 22, after: 15, color: '#f59e0b' },
    { key: 'low', label: 'Thấp', before: 19, after: 32, color: '#10b981' },
  ],
};

const pct = (count, total) =>
  total ? Math.round((count * 1000) / total) / 10 : 0;

const StudyTable = ({ study }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse text-sm">
      <thead>
        <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="border border-slate-200 px-3 py-2 font-semibold">
            Mức độ đi tắt nhận thức
          </th>
          <th className="border border-slate-200 px-3 py-2 font-semibold">SL trước</th>
          <th className="border border-slate-200 px-3 py-2 font-semibold">Tỷ lệ trước</th>
          <th className="border border-slate-200 px-3 py-2 font-semibold">SL sau</th>
          <th className="border border-slate-200 px-3 py-2 font-semibold">Tỷ lệ sau</th>
        </tr>
      </thead>
      <tbody>
        {study.levels.map((level) => (
          <tr key={level.key}>
            <td className="border border-slate-200 px-3 py-2 font-medium">{level.label}</td>
            <td className="border border-slate-200 px-3 py-2 text-center">{level.before}</td>
            <td className="border border-slate-200 px-3 py-2 text-center">
              {pct(level.before, study.n)}%
            </td>
            <td className="border border-slate-200 px-3 py-2 text-center">{level.after}</td>
            <td className="border border-slate-200 px-3 py-2 text-center">
              {pct(level.after, study.n)}%
            </td>
          </tr>
        ))}
        <tr className="bg-slate-50 font-semibold">
          <td className="border border-slate-200 px-3 py-2">Tổng</td>
          <td className="border border-slate-200 px-3 py-2 text-center">{study.n}</td>
          <td className="border border-slate-200 px-3 py-2 text-center">100%</td>
          <td className="border border-slate-200 px-3 py-2 text-center">{study.n}</td>
          <td className="border border-slate-200 px-3 py-2 text-center">100%</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const GroupedBarChart = ({ study, mode = 'count' }) => {
  const max =
    mode === 'percent'
      ? 100
      : Math.max(1, ...study.levels.flatMap((level) => [level.before, level.after]));
  return (
    <div className="space-y-4">
      {study.levels.map((level) => {
        const beforeValue = mode === 'percent' ? pct(level.before, study.n) : level.before;
        const afterValue = mode === 'percent' ? pct(level.after, study.n) : level.after;
        const unit = mode === 'percent' ? '%' : '';
        return (
          <div key={level.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }} />
                {level.label}
              </span>
              <span className="text-xs text-slate-500">
                {beforeValue}
                {unit} → {afterValue}
                {unit}
              </span>
            </div>
            <div className="flex items-end gap-3" style={{ height: 88 }}>
              {[
                ['Trước', beforeValue, '#64748b'],
                ['Sau', afterValue, level.color],
              ].map(([label, value, color]) => (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {value}
                    {unit}
                  </span>
                  <div className="flex h-16 w-full items-end rounded bg-slate-100">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${Math.max(value ? 6 : 0, (value * 100) / max)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DistributionPie = ({ title, items, total }) => {
  const active = items.filter((item) => item.value > 0);
  let start = 0;
  const segments = active.map((item) => {
    const end = start + (item.value * 100) / Math.max(total, 1);
    const segment = `${item.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div
          className="relative h-32 w-32 shrink-0 rounded-full shadow-inner"
          style={{
            background: active.length
              ? `conic-gradient(${segments.join(', ')})`
              : '#e2e8f0',
          }}
          role="img"
          aria-label={title}
        >
          <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-lg leading-none text-slate-800">{total}</strong>
            <span className="text-[9px] text-slate-500">học sinh</span>
          </div>
        </div>
        <div className="w-full space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <strong>
                {item.value} · {pct(item.value, total)}%
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StackedCompare = ({ study }) => {
  const phases = [
    ['Trước can thiệp', 'before'],
    ['Sau can thiệp', 'after'],
  ];
  return (
    <div className="space-y-5">
      {phases.map(([label, key]) => {
        const total = study.n || 1;
        return (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{label}</span>
              <strong>n = {study.n}</strong>
            </div>
            <div className="flex h-8 overflow-hidden rounded-md bg-slate-100">
              {study.levels.map((level) => {
                const value = level[key];
                if (!value) return null;
                return (
                  <div
                    key={level.key}
                    className="flex items-center justify-center text-[10px] font-semibold text-white"
                    title={`${level.label}: ${value} (${pct(value, total)}%)`}
                    style={{
                      width: `${(value * 100) / total}%`,
                      backgroundColor: level.color,
                    }}
                  >
                    {value >= 4 ? `${level.label} ${pct(value, total)}%` : ''}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {study.levels.map((level) => (
          <span key={level.key} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }} />
            {level.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SlopeChart = ({ study }) => {
  const width = 320;
  const height = 200;
  const padX = 48;
  const padY = 24;
  const max = Math.max(1, ...study.levels.flatMap((level) => [level.before, level.after]));
  const x1 = padX;
  const x2 = width - padX;
  const yOf = (value) => padY + ((max - value) / max) * (height - padY * 2);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-52 w-full max-w-md" role="img" aria-label="Biểu đồ dốc trước-sau">
        <line x1={x1} y1={padY} x2={x1} y2={height - padY} stroke="#e2e8f0" />
        <line x1={x2} y1={padY} x2={x2} y2={height - padY} stroke="#e2e8f0" />
        <text x={x1} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[10px]">
          Trước
        </text>
        <text x={x2} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[10px]">
          Sau
        </text>
        {study.levels.map((level) => {
          const y1 = yOf(level.before);
          const y2 = yOf(level.after);
          return (
            <g key={level.key}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={level.color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx={x1} cy={y1} r="5" fill={level.color} />
              <circle cx={x2} cy={y2} r="5" fill={level.color} />
              <text x={x1 - 8} y={y1 + 4} textAnchor="end" className="fill-slate-700 text-[10px] font-semibold">
                {level.before}
              </text>
              <text x={x2 + 8} y={y2 + 4} textAnchor="start" className="fill-slate-700 text-[10px] font-semibold">
                {level.after}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
        {study.levels.map((level) => (
          <span key={level.key} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }} />
            {level.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const DeltaBars = ({ study }) => {
  const deltas = study.levels.map((level) => ({
    ...level,
    delta: level.after - level.before,
    deltaPct: pct(level.after, study.n) - pct(level.before, study.n),
  }));
  const maxAbs = Math.max(1, ...deltas.map((item) => Math.abs(item.delta)));

  return (
    <div className="space-y-4">
      {deltas.map((item) => {
        const positive = item.delta >= 0;
        const width = (Math.abs(item.delta) * 50) / maxAbs;
        return (
          <div key={item.key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <strong className={positive ? 'text-emerald-700' : 'text-red-600'}>
                {positive ? '+' : ''}
                {item.delta} ({positive ? '+' : ''}
                {item.deltaPct.toFixed(1)} điểm %)
              </strong>
            </div>
            <div className="relative h-4 rounded bg-slate-100">
              <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
              <div
                className="absolute top-0 h-full rounded"
                style={{
                  backgroundColor: item.color,
                  width: `${width}%`,
                  left: positive ? '50%' : `${50 - width}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const InsightCards = ({ study }) => {
  const high = study.levels.find((level) => level.key === 'high');
  const medium = study.levels.find((level) => level.key === 'medium');
  const low = study.levels.find((level) => level.key === 'low');
  const cards = [
    {
      label: 'Giảm mức Cao',
      value: `${high.before} → ${high.after}`,
      note: `Δ ${high.after - high.before} HS (${pct(high.before, study.n)}% → ${pct(high.after, study.n)}%)`,
      color: 'text-red-700',
    },
    {
      label: 'Giảm mức Trung bình',
      value: `${medium.before} → ${medium.after}`,
      note: `Δ ${medium.after - medium.before} HS (${pct(medium.before, study.n)}% → ${pct(medium.after, study.n)}%)`,
      color: 'text-amber-700',
    },
    {
      label: 'Tăng mức Thấp',
      value: `${low.before} → ${low.after}`,
      note: `Δ +${low.after - low.before} HS (${pct(low.before, study.n)}% → ${pct(low.after, study.n)}%)`,
      color: 'text-emerald-700',
    },
    {
      label: 'Cỡ mẫu',
      value: `n = ${study.n}`,
      note: 'Cùng nhóm trước / sau can thiệp',
      color: 'text-slate-800',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="mt-1 text-xs text-slate-500">{card.note}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Khối biểu đồ nghiên cứu: phân loại mức độ đi tắt nhận thức trước/sau can thiệp.
 * @param {{ study?: typeof HEURISTIC_STUDY, liveStudy?: typeof HEURISTIC_STUDY | null }} props
 */
const HeuristicLevelCharts = ({ study = HEURISTIC_STUDY, liveStudy = null }) => {
  const beforeItems = study.levels.map((level) => ({
    label: level.label,
    value: level.before,
    color: level.color,
  }));
  const afterItems = study.levels.map((level) => ({
    label: level.label,
    value: level.after,
    color: level.color,
  }));

  return (
    <section className="mt-5 space-y-5 rounded-xl border border-seablue-100 bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-seablue-700">
            Phân tích nghiên cứu
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">{study.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            So sánh phân bố mức độ đi tắt nhận thức (Cao / Trung bình / Thấp) trước và sau can thiệp
            trên cùng mẫu {study.n} học sinh — phục vụ báo cáo kết quả can thiệp.
          </p>
        </div>
      </header>

      <InsightCards study={study} />

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Bảng phân loại (số liệu gốc)</h3>
        <StudyTable study={study} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Biểu đồ cột nhóm — số lượng (SL trước / SL sau)
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Mục đích: so sánh tuyệt đối số học sinh theo từng mức trước và sau can thiệp.
          </p>
          <div className="mt-4">
            <GroupedBarChart study={study} mode="count" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Biểu đồ cột nhóm — tỷ lệ (%)
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Mục đích: đọc sự dịch chuyển tỷ trọng trong tổng mẫu n = {study.n}.
          </p>
          <div className="mt-4">
            <GroupedBarChart study={study} mode="percent" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <DistributionPie title="Phân bố trước can thiệp" items={beforeItems} total={study.n} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <DistributionPie title="Phân bố sau can thiệp" items={afterItems} total={study.n} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Biểu đồ thanh chồng — cơ cấu mẫu</h3>
          <p className="mt-1 text-xs text-slate-500">
            Mục đích: nhìn tổng thể tỷ lệ Cao / Trung bình / Thấp trong cùng n = {study.n}.
          </p>
          <div className="mt-4">
            <StackedCompare study={study} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Biểu đồ dốc (slope) — xu hướng từng mức</h3>
          <p className="mt-1 text-xs text-slate-500">
            Mục đích: làm rõ Cao và Trung bình giảm, Thấp tăng sau can thiệp.
          </p>
          <div className="mt-2">
            <SlopeChart study={study} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800">Biến thiên sau can thiệp (Δ)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Mục đích: định lượng hiệu quả can thiệp theo từng mức độ đi tắt nhận thức.
        </p>
        <div className="mt-4">
          <DeltaBars study={study} />
        </div>
      </div>

      {liveStudy && liveStudy.n > 0 && (
        <div className="rounded-xl border border-dashed border-seablue-200 bg-seablue-50/40 p-4">
          <h3 className="text-sm font-semibold text-seablue-900">
            Đối chiếu dữ liệu hệ thống hiện tại (n = {liveStudy.n})
          </h3>
          <p className="mt-1 text-xs text-seablue-800/80">
            Phân bố theo điểm rủi ro đầu kỳ (baseline) và hiện tại trong bộ lọc dashboard — dùng để
            so với kết quả nghiên cứu bên trên.
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <StudyTable study={liveStudy} />
            <StackedCompare study={liveStudy} />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeuristicLevelCharts;

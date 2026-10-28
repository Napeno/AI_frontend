import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiClient, get, post } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
const labels = {
  risk: "Điểm rủi ro",
  hints: "Số gợi ý",
  fullAnswers: "Yêu cầu lời giải",
  attemptRate: "Tỷ lệ tự thử",
  correctRate: "Tỷ lệ đúng",
};
const subjectLabels = {
  mathematics: "Toán",
  natural_sciences: "KHTN",
  social_sciences: "KHXH",
  english_language: "Tiếng Anh",
  unclassified: "Chưa phân loại",
};
const educationLabels = {
  elementary: "Tiểu học",
  middle: "THCS",
  high: "THPT",
  unclassified: "Chưa phân loại",
};
const riskLabels = {
  low: "Thấp",
  watch: "Cần theo dõi",
  high: "Cao",
};
const riskColors = {
  low: "#10b981",
  watch: "#f59e0b",
  high: "#ef4444",
};
const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";
const queryFor = (filters, extra = {}) => {
  const params = new URLSearchParams();
  Object.entries({
    ...filters,
    ...extra,
  }).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null)
      params.set(key, value);
  });
  return params.toString();
};
const RiskBadge = ({ level }) => (
  <span
    className={`rounded-full px-2 py-1 text-xs font-semibold ${level === "high" ? "bg-red-100 text-red-800" : level === "watch" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
  >
    {riskLabels[level] || "Chưa rõ"}
  </span>
);
const SimpleChart = ({ points = [], metric }) => {
  const max = Math.max(1, ...points.map((point) => point.value));
  if (!points.length)
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        Chưa có event trong bộ lọc này.
      </p>
    );
  return (
    <div className="mt-4 w-full max-w-full overflow-x-auto">
      <div
        className="flex min-w-max items-end gap-3 px-2 pt-6"
        style={{
          minHeight: 220,
        }}
      >
        {points.map((point) => (
          <div
            key={point.label}
            className="flex w-16 flex-col items-center gap-2 text-center"
          >
            <span className="text-xs font-semibold text-seablue-700">
              {point.value}
              {["attemptRate", "correctRate"].includes(metric) ? "%" : ""}
            </span>
            <div className="flex h-32 w-9 items-end rounded-t bg-seablue-100">
              <div
                className="w-full rounded-t bg-seablue-600"
                style={{
                  height: `${Math.max(4, (point.value * 100) / max)}%`,
                }}
              />
            </div>
            <span className="w-20 break-words text-[10px] text-gray-500">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
const shortDate = (label = "") => {
  const parts = String(label).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return label;
  return label;
};

const MetricBarScrollChart = ({
  points = [],
  title,
  subtitle,
  barClassName = "bg-seablue-600",
  trackClassName = "bg-seablue-100",
  valueClassName = "text-seablue-700",
  minMax = 1,
}) => {
  const max = Math.max(
    minMax,
    ...points.map((point) => Number(point.value) || 0),
  );
  if (!points.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {subtitle ? (
        <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
      ) : null}
      <div className="mt-3 w-full overflow-x-auto pb-1">
        <div
          className="flex min-w-max items-end gap-3 px-2 pt-4"
          style={{ minHeight: 220 }}
        >
          {points.map((point) => {
            const value = Number(point.value) || 0;
            return (
              <div
                key={point.label}
                className="flex w-16 flex-col items-center gap-2 text-center"
              >
                <span className={`text-xs font-semibold ${valueClassName}`}>
                  {value}
                </span>
                <div
                  className={`flex h-32 w-9 items-end rounded-t ${trackClassName}`}
                >
                  <div
                    className={`w-full rounded-t ${barClassName}`}
                    style={{
                      height: `${Math.max(4, (value * 100) / max)}%`,
                    }}
                  />
                </div>
                <span className="w-20 break-words text-[10px] text-gray-500">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RiskBarScrollChart = ({ points = [] }) => (
  <MetricBarScrollChart
    points={points}
    title="Điểm rủi ro theo ngày"
    subtitle="Điểm rủi ro trung bình từng ngày · kéo ngang để xem thêm"
    minMax={100}
  />
);

const DailyStatusChart = ({ points = [], riskPoints = [] }) => {
  const [selected, setSelected] = useState(null);
  if (!points.length)
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        Chưa có event trong bộ lọc này.
      </p>
    );

  const width = Math.max(640, points.length * 28);
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxCount = Math.max(
    1,
    ...points.map((point) =>
      Math.max(point.high || 0, point.watch || 0, point.low || 0, point.total || 0),
    ),
  );
  const xAt = (index) =>
    pad.left + (points.length <= 1 ? innerW / 2 : (index * innerW) / (points.length - 1));
  const yAt = (value) => pad.top + innerH - (value / maxCount) * innerH;
  const series = [
    ["high", riskColors.high, "Cao"],
    ["watch", riskColors.watch, "Theo dõi"],
    ["low", riskColors.low, "Thấp"],
  ];
  const pathFor = (key) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(point[key] || 0)}`)
      .join(" ");
  const active = selected == null ? null : points[selected];
  const barPoints =
    riskPoints.length > 0
      ? riskPoints
      : points.map((point) => ({
          label: point.label,
          value: point.averageRisk ?? point.value ?? 0,
        }));

  return (
    <div className="mt-4 space-y-4">
      <RiskBarScrollChart points={barPoints} />

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        {series.map(([, color, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="text-gray-400">·</span>
        <span>Đường = số học sinh theo trạng thái từng ngày · bấm điểm để xem chi tiết</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-slate-50/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-56 w-full min-w-[640px]"
          role="img"
          aria-label="Biểu đồ trạng thái học sinh theo ngày"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = pad.top + innerH * (1 - ratio);
            const value = Math.round(maxCount * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" className="fill-slate-400 text-[10px]">
                  {value}
                </text>
              </g>
            );
          })}
          {series.map(([key, color]) => (
            <path
              key={key}
              d={pathFor(key)}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {points.map((point, index) => (
            <g key={point.label}>
              <line
                x1={xAt(index)}
                x2={xAt(index)}
                y1={pad.top}
                y2={pad.top + innerH}
                stroke={selected === index ? "#94a3b8" : "transparent"}
                strokeWidth="1"
              />
              {series.map(([key, color]) => (
                <circle
                  key={`${point.label}-${key}`}
                  cx={xAt(index)}
                  cy={yAt(point[key] || 0)}
                  r={selected === index ? 4.5 : 3}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer"
                  onClick={() => setSelected(index)}
                >
                  <title>{`${point.label} · ${key}: ${point[key] || 0}`}</title>
                </circle>
              ))}
              {(index === 0 ||
                index === points.length - 1 ||
                index % Math.max(1, Math.ceil(points.length / 8)) === 0) && (
                <text
                  x={xAt(index)}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {shortDate(point.label)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {active && (
        <div className="grid gap-2 rounded-lg border border-seablue-100 bg-white p-3 text-sm sm:grid-cols-6">
          <div>
            <p className="text-xs text-gray-500">Ngày</p>
            <p className="font-semibold">{active.label}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cao</p>
            <p className="font-semibold text-red-600">{active.high}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Theo dõi</p>
            <p className="font-semibold text-amber-600">{active.watch}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Thấp</p>
            <p className="font-semibold text-emerald-600">{active.low}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Đã cải thiện</p>
            <p className="font-semibold text-seablue-700">↑{active.improved}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">TB rủi ro · n</p>
            <p className="font-semibold">
              {active.averageRisk} · {active.total}
            </p>
          </div>
        </div>
      )}

      <div className="max-h-72 overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2 text-red-600">Cao</th>
              <th className="px-3 py-2 text-amber-600">Theo dõi</th>
              <th className="px-3 py-2 text-emerald-600">Thấp</th>
              <th className="px-3 py-2">Cải thiện</th>
              <th className="px-3 py-2">TB rủi ro</th>
              <th className="px-3 py-2">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, index) => (
              <tr
                key={point.label}
                onClick={() => setSelected(index)}
                className={`cursor-pointer border-t ${selected === index ? "bg-seablue-50" : "hover:bg-gray-50"}`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-medium">{point.label}</td>
                <td className="px-3 py-2 font-semibold text-red-600">{point.high}</td>
                <td className="px-3 py-2 font-semibold text-amber-600">{point.watch}</td>
                <td className="px-3 py-2 font-semibold text-emerald-600">{point.low}</td>
                <td className="px-3 py-2 text-seablue-700">↑{point.improved}</td>
                <td className="px-3 py-2">{point.averageRisk}</td>
                <td className="px-3 py-2">{point.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const DonutChart = ({ distribution }) => {
  const total =
    Object.values(distribution || {}).reduce((sum, value) => sum + value, 0) ||
    1;
  const high = distribution?.high || 0;
  const watch = distribution?.watch || 0;
  const low = distribution?.low || 0;
  let offset = 0;
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg
          viewBox="0 0 120 120"
          className="h-40 w-40 -rotate-90"
          role="img"
          aria-label="Phân bố mức rủi ro"
        >
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="18"
          />
          {["high", "watch", "low"].map((level) => {
            const value = distribution?.[level] || 0;
            const length = (value / total) * 289;
            const segment = (
              <circle
                key={level}
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke={riskColors[level]}
                strokeWidth="18"
                strokeDasharray={`${length} ${289 - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return segment;
          })}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            transform="rotate(90 60 60)"
            className="fill-gray-700 text-lg font-bold"
          >
            {total}
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            transform="rotate(90 60 60)"
            className="fill-gray-500 text-[9px]"
          >
            học sinh
          </text>
        </svg>
        <div className="w-full space-y-3">
          {["high", "watch", "low"].map((level) => (
            <div
              key={level}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <i
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: riskColors[level],
                  }}
                />
                {riskLabels[level]}
              </span>
              <strong>
                {distribution?.[level] || 0} ·{" "}
                {Math.round(((distribution?.[level] || 0) * 100) / total)}%
              </strong>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Ưu tiên can thiệp</h3>
          <PieChart
            items={[
              {
                label: "Cao",
                value: high,
                color: riskColors.high,
              },
              {
                label: "Chưa khẩn cấp",
                value: watch + low,
                color: "#94a3b8",
              },
            ]}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Nhóm cần theo dõi</h3>
          <PieChart
            items={[
              {
                label: "Cao + Theo dõi",
                value: high + watch,
                color: "#f97316",
              },
              {
                label: "Thấp",
                value: low,
                color: riskColors.low,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
const PieChart = ({
  items = [],
  colors = ["#0ea5b7", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
}) => {
  const values = items.filter((item) => item.value > 0);
  const total = values.reduce((sum, item) => sum + item.value, 0);
  if (!total)
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Chưa có dữ liệu trong bộ lọc này.
      </p>
    );
  let start = 0;
  const segments = values.map((item, index) => {
    const end = start + (item.value * 100) / total;
    const segment = `${item.color || colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div
        className="h-28 w-28 shrink-0 rounded-full shadow-inner"
        style={{
          background: `conic-gradient(${segments.join(", ")})`,
        }}
        role="img"
        aria-label="Biểu đồ tròn"
      />
      <div className="w-full space-y-2">
        {values.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <i
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color || colors[index % colors.length],
                }}
              />
              {item.label}
            </span>
            <strong>
              {item.value} · {Math.round((item.value * 100) / total)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};
const TodayActivity = ({ today }) => (
  <section className="mt-6 border-t pt-5">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Hoạt động hôm nay</h3>
      <strong className="rounded-full bg-seablue-50 px-3 py-1 text-sm text-seablue-700">
        {today.activeStudents} học sinh
      </strong>
    </div>
    <div className="mt-4 grid gap-5 sm:grid-cols-2">
      <div>
        <h4 className="text-sm font-medium text-gray-600">
          Mức rủi ro hôm nay
        </h4>
        <PieChart items={today.riskDistribution} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">Cơ cấu hành vi</h4>
        <PieChart items={today.behaviors} />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      {today.students.length ? (
        today.students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <div>
              <strong>{student.name}</strong>
              {student.username && (
                <span className="ml-1 text-gray-500">@{student.username}</span>
              )}
              <span className="ml-2 text-gray-500">· {student.behavior}</span>
            </div>
            <RiskBadge level={student.riskLevel} />
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">
          Chưa có hoạt động trong hôm nay.
        </p>
      )}
    </div>
  </section>
);
const HorizontalBars = ({ items = [] }) => {
  const rows = Array.isArray(items) ? items : items.items || [];
  const max = Math.max(1, ...rows.map((item) => item.value));
  return (
    <>
      <div className="mt-4 space-y-3">
        {rows.map((item) => (
          <div key={item.key || item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="h-3 overflow-hidden rounded bg-gray-100">
              <div
                className="h-full rounded bg-seablue-600"
                style={{
                  width: `${(item.value * 100) / max}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {items.today && <TodayActivity today={items.today} />}
    </>
  );
};
const StackedRiskBars = ({ rows = [], labelsByKey }) => {
  if (!rows.length)
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Chưa có dữ liệu trong bộ lọc này.
      </p>
    );
  return (
    <div className="mt-4 space-y-4">
      {rows.map((row) => {
        const total = row.high + row.watch + row.low || 1;
        return (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{labelsByKey[row.label] || row.label}</span>
              <strong>{total}</strong>
            </div>
            <div className="flex h-5 overflow-hidden rounded bg-gray-100">
              {["high", "watch", "low"].map((level) =>
                row[level] ? (
                  <div
                    key={level}
                    title={`${riskLabels[level]}: ${row[level]}`}
                    style={{
                      width: `${(row[level] * 100) / total}%`,
                      backgroundColor: riskColors[level],
                    }}
                  />
                ) : null,
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const StudentDetail = ({ detail, onClose, onAddNote }) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  if (!detail) return null;
  const { student } = detail;
  const submit = async (event) => {
    event.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    try {
      if (await onAddNote(student.id, note.trim())) setNote("");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      <section className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-sm text-gray-500">
              {student.username && `@${student.username}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 hover:bg-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Điểm đầu", student.baselineScore],
            ["Hiện tại", student.behavioralRisk],
            ["Đã giảm", `-${student.improvement}`],
            ["Tự thử", `${student.attemptRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <RiskBadge level={student.riskLevel} />{" "}
          <span className="ml-2 text-sm text-gray-600">
            {student.recommendation}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Phiên chat", student.conversations],
            ["Kiểm tra đáp án", student.answerChecks],
            ["Gợi ý nhanh", student.rapidHintRequests],
            ["Hoạt động gần nhất", formatDate(student.latestActivity)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-white p-3">
              <p className="text-gray-500">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Cấp: {student.educationLevel}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Môn: {student.subjectArea}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Lớp: {student.classProfile?.className || "Chưa có"}
          </span>
        </div>
        <div className="mt-6 rounded-xl border p-4">
          <h3 className="font-semibold">
            Xu hướng {labels[detail.chart.metric]}
          </h3>
          <SimpleChart
            points={detail.chart.points}
            metric={detail.chart.metric}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Gợi ý", student.hintRequests],
            ["Lời giải", student.fullAnswerRequests],
            ["Đúng", `${student.correctRate}%`],
            ["Can thiệp", student.gateCompletions],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border p-3">
              <p className="text-gray-500">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Ghi chú giáo viên</h3>
          <form onSubmit={submit} className="mt-2">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength="2000"
              rows="3"
              className="w-full rounded-lg border p-3"
              placeholder="Kế hoạch hoặc nhận xét can thiệp..."
            />
            <button
              disabled={!note.trim() || saving}
              className="mt-2 rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Thêm ghi chú"}
            </button>
          </form>
          <div className="mt-3 space-y-2">
            {detail.notes.map((item, index) => (
              <div
                className="rounded-lg border p-3 text-sm"
                key={`${item.createdAt}-${index}`}
              >
                <p>{item.body}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const LegacyAdminDashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    educationLevel: "",
    subjectArea: "",
    riskLevel: "",
    search: "",
    metric: "risk",
    groupBy: "day",
    sortBy: "behavioralRisk",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await get(`/admin/analytics?${queryFor(filters)}`);
      if (!response.ok) throw new Error("Không tải được dữ liệu dashboard");
      setData(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    load();
  }, [load]);
  if (user?.role !== "admin") return <Navigate to="/chat" replace />;
  const updateFilter = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  const sortBy = (key) =>
    setFilters((current) => ({
      ...current,
      sortBy: key,
      sortOrder:
        current.sortBy === key && current.sortOrder === "desc" ? "asc" : "desc",
      page: 1,
    }));
  const openStudent = async (id) => {
    const response = await get(
      `/admin/students/${id}?${queryFor(filters, {
        page: undefined,
        limit: undefined,
        search: undefined,
      })}`,
    );
    if (response.ok) setDetail(await response.json());
    else setError("Không tải được hồ sơ học sinh");
  };
  const addNote = async (id, body) => {
    const response = await post(`/admin/students/${id}/notes`, {
      body,
    });
    if (!response.ok) return setError("Không lưu được ghi chú");
    await openStudent(id);
    return true;
  };
  const exportCsv = async () => {
    const response = await apiClient(
      `/admin/analytics/export?${queryFor(filters, {
        page: undefined,
        limit: undefined,
      })}`,
    );
    if (!response.ok) return setError("Không xuất được CSV");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-dependency-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const columns = [
    ["name", "Học sinh"],
    ["baselineScore", "Điểm đầu"],
    ["behavioralRisk", "Hiện tại"],
    ["improvement", "Đã giảm"],
    ["riskLevel", "Mức"],
    [null, "Hành vi cần can thiệp"],
    ["attemptRate", "Tự thử"],
    ["correctRate", "Đúng"],
    ["latestActivity", "Hoạt động"],
  ];
  const summaryCards = data
    ? [
        [
          "Cần can thiệp ngay",
          data.summary.requiresIntervention,
          "text-red-700",
        ],
        ["Cần theo dõi", data.summary.watchingStudents, "text-amber-700"],
        ["Đã cải thiện", data.summary.improvedStudents, "text-emerald-700"],
        ["TB rủi ro", data.summary.averageBehavioralRisk, "text-seablue-700"],
        ["Tổng học sinh", data.summary.totalStudents, "text-gray-800"],
      ]
    : [];
  const sortMark = (key) =>
    filters.sortBy === key ? (filters.sortOrder === "asc" ? " ↑" : " ↓") : "";
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Dashboard giáo viên</h1>
            <p className="mt-1 text-sm text-gray-600">
              Ưu tiên học sinh có mức phụ thuộc AI cao và theo dõi tiến bộ học
              chủ động.
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Xuất CSV
          </button>
        </div>
        <section className="mt-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            Từ ngày
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="text-sm">
            Đến ngày
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="text-sm">
            Môn
            <select
              value={filters.subjectArea}
              onChange={(event) =>
                updateFilter("subjectArea", event.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(subjectLabels)
                .filter(([key]) => key !== "unclassified")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Mức rủi ro
            <select
              value={filters.riskLevel}
              onChange={(event) =>
                updateFilter("riskLevel", event.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(riskLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Cấp học
            <select
              value={filters.educationLevel}
              onChange={(event) =>
                updateFilter("educationLevel", event.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(educationLabels)
                .filter(([key]) => key !== "unclassified")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Chỉ số biểu đồ
            <select
              value={filters.metric}
              onChange={(event) => updateFilter("metric", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              {Object.entries(labels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Nhóm theo
            <select
              value={filters.groupBy}
              onChange={(event) => updateFilter("groupBy", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="subject">Môn</option>
              <option value="riskLevel">Mức rủi ro</option>
            </select>
          </label>
          <label className="text-sm">
            Tìm học sinh
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              className="mt-1 w-full rounded border p-2"
              placeholder="Tên hoặc username"
            />
          </label>
        </section>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="py-16 text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : (
          data && (
            <>
              <></>
              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {summaryCards.map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className={`mt-1 text-3xl font-bold ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </section>
              <section className="mt-5 grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
                  <h2 className="font-semibold">
                    {labels[data.chart.metric]} theo{" "}
                    {filters.groupBy === "day"
                      ? "ngày"
                      : filters.groupBy === "week"
                        ? "tuần"
                        : filters.groupBy === "subject"
                          ? "môn"
                          : "mức rủi ro"}
                  </h2>
                  <SimpleChart
                    points={data.chart.points}
                    metric={data.chart.metric}
                  />
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Phân bố mức rủi ro</h2>
                  <DonutChart distribution={data.summary.riskDistribution} />
                </div>
              </section>
              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Hành vi cần theo dõi</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Tổng hành vi trong bộ lọc hiện tại
                  </p>
                  <HorizontalBars items={data.breakdowns?.behaviors} />
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Phân bố mức cải thiện</h2>
                  <SimpleChart
                    points={data.breakdowns?.improvement}
                    metric="students"
                  />
                </div>
              </section>
              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Rủi ro theo môn học</h2>
                  <StackedRiskBars
                    rows={data.breakdowns?.riskBySubject}
                    labelsByKey={subjectLabels}
                  />
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Rủi ro theo cấp học</h2>
                  <StackedRiskBars
                    rows={data.breakdowns?.riskByEducationLevel}
                    labelsByKey={educationLabels}
                  />
                </div>
              </section>
              <section className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      {columns.map(([key, label]) => (
                        <th key={label} className="px-4 py-3">
                          {key ? (
                            <button
                              onClick={() => sortBy(key)}
                              className="font-semibold hover:text-seablue-700"
                              title={`Sắp xếp theo ${label}`}
                            >
                              {label}
                              {sortMark(key)}
                            </button>
                          ) : (
                            label
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => openStudent(student.id)}
                        className="cursor-pointer border-t hover:bg-seablue-50"
                      >
                        <td className="px-4 py-3">
                          <strong>{student.name}</strong>
                          {student.username && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">
                                @{student.username}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3">{student.baselineScore}</td>
                        <td className="px-4 py-3 font-bold">
                          {student.behavioralRisk}
                        </td>
                        <td className="px-4 py-3 text-emerald-700">
                          -{student.improvement}
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge level={student.riskLevel} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-xs text-gray-600">
                          {student.recommendation}
                        </td>
                        <td className="px-4 py-3">{student.attemptRate}%</td>
                        <td className="px-4 py-3">{student.correctRate}%</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(student.latestActivity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t p-3 text-sm">
                  <span>
                    Trang {data.pagination.page}/{data.pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={data.pagination.page === 1}
                      onClick={() =>
                        updateFilter("page", data.pagination.page - 1)
                      }
                      className="rounded border px-3 py-1 disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <button
                      disabled={
                        data.pagination.page === data.pagination.totalPages
                      }
                      onClick={() =>
                        updateFilter("page", data.pagination.page + 1)
                      }
                      className="rounded border px-3 py-1 disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </section>
            </>
          )
        )}
      </div>
      <StudentDetail
        detail={detail}
        onClose={() => setDetail(null)}
        onAddNote={addNote}
      />
    </main>
  );
};
const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    from: "2026-04-25",
    to: "2026-05-25",
    className: "",
    educationLevel: "",
    subjectArea: "",
    riskLevel: "",
    search: "",
    metric: "risk",
    groupBy: "day",
    sortBy: "behavioralRisk",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await get(`/admin/analytics?${queryFor(filters)}`);
      if (!response.ok) throw new Error("Không tải được dữ liệu dashboard");
      setData(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    load();
  }, [load]);
  if (user?.role !== "admin") return <Navigate to="/chat" replace />;
  const update = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  const sort = (sortBy) =>
    setFilters((current) => ({
      ...current,
      sortBy,
      sortOrder:
        current.sortBy === sortBy && current.sortOrder === "desc"
          ? "asc"
          : "desc",
      page: 1,
    }));
  const openStudent = async (id) => {
    const response = await get(
      `/admin/students/${id}?${queryFor(filters, {
        page: undefined,
        limit: undefined,
        search: undefined,
      })}`,
    );
    if (response.ok) setDetail(await response.json());
    else setError("Không tải được hồ sơ học sinh");
  };
  const addNote = async (id, body) => {
    const response = await post(`/admin/students/${id}/notes`, {
      body,
    });
    if (!response.ok) return setError("Không lưu được ghi chú");
    await openStudent(id);
    return true;
  };
  const exportCsv = async () => {
    const response = await apiClient(
      `/admin/analytics/export?${queryFor(filters, {
        page: undefined,
        limit: undefined,
      })}`,
    );
    if (!response.ok) return setError("Không xuất được CSV");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-dependency-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const columns = [
    ["name", "Học sinh"],
    ["baselineScore", "Điểm đầu"],
    ["behavioralRisk", "Hiện tại"],
    ["improvement", "Đã giảm"],
    ["riskLevel", "Mức"],
    [null, "Hành vi cần can thiệp"],
    ["attemptRate", "Tự thử"],
    ["correctRate", "Đúng"],
    ["latestActivity", "Hoạt động"],
  ];
  const groupLabels = {
    day: "ngày",
    week: "tuần",
    month: "tháng",
    subject: "môn",
    riskLevel: "mức rủi ro",
  };
  const mark = (key) =>
    filters.sortBy === key ? (filters.sortOrder === "asc" ? " ↑" : " ↓") : "";
  const cards = data
    ? [
        [
          "Cần can thiệp ngay",
          data.summary.requiresIntervention,
          "text-red-700",
        ],
        ["Cần theo dõi", data.summary.watchingStudents, "text-amber-700"],
        ["Đã cải thiện", data.summary.improvedStudents, "text-emerald-700"],
        ["TB rủi ro", data.summary.averageBehavioralRisk, "text-seablue-700"],
        ["Tổng học sinh", data.summary.totalStudents, "text-gray-800"],
        ...(data.summary.dailyActiveStudents != null
          ? [
              [
                "HS vào web (ngày cuối)",
                data.summary.dailyActiveStudents,
                "text-amber-700",
              ],
            ]
          : []),
        ...(data.summary.cumulativeParticipants != null &&
        filters.className === "sim-179"
          ? [
              [
                "Đã tham gia (lũy kế)",
                data.summary.cumulativeParticipants,
                "text-emerald-700",
              ],
            ]
          : []),
      ]
    : [];
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Dashboard giáo viên</h1>
            <p className="mt-1 text-sm text-gray-600">
              Ưu tiên can thiệp và theo dõi tiến bộ học chủ động.
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Xuất CSV
          </button>
        </header>
        <section className="mt-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            Từ ngày
            <input
              type="date"
              value={filters.from}
              onChange={(event) => update("from", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="text-sm">
            Đến ngày
            <input
              type="date"
              value={filters.to}
              onChange={(event) => update("to", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="text-sm">
            Nhóm dữ liệu
            <select
              value={filters.className}
              onChange={(event) => {
                const className = event.target.value;
                setFilters((current) => ({
                  ...current,
                  className,
                  from: className === "sim-179" ? "2026-04-01" : "2026-04-25",
                  to: className === "sim-179" ? "2026-11-01" : "2026-05-25",
                  page: 1,
                }));
              }}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Lớp 8.2 (47 HS)</option>
              <option value="sim-179">Nhóm 179 HS</option>
            </select>
          </label>
          <label className="text-sm">
            Môn
            <select
              value={filters.subjectArea}
              onChange={(event) => update("subjectArea", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(subjectLabels)
                .filter(([key]) => key !== "unclassified")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Mức rủi ro
            <select
              value={filters.riskLevel}
              onChange={(event) => update("riskLevel", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(riskLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Cấp học
            <select
              value={filters.educationLevel}
              onChange={(event) => update("educationLevel", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">Tất cả</option>
              {Object.entries(educationLabels)
                .filter(([key]) => key !== "unclassified")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Chỉ số biểu đồ
            <select
              value={filters.metric}
              onChange={(event) => update("metric", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              {Object.entries(labels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Nhóm theo
            <select
              value={filters.groupBy}
              onChange={(event) => update("groupBy", event.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="subject">Môn</option>
              <option value="riskLevel">Mức rủi ro</option>
            </select>
          </label>
          <label className="text-sm">
            Tìm học sinh
            <input
              value={filters.search}
              onChange={(event) => update("search", event.target.value)}
              className="mt-1 w-full rounded border p-2"
              placeholder="Tên hoặc username"
            />
          </label>
        </section>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="py-16 text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : (
          data && (
            <>
              <></>
              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {cards.map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className={`mt-1 text-3xl font-bold ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </section>
              <section className="mt-5 grid gap-5 lg:grid-cols-3">
                <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
                  <h2 className="font-semibold">
                    {filters.metric === "risk"
                      ? `Trạng thái học sinh theo ${groupLabels[filters.groupBy]}`
                      : `${labels[data.chart.metric]} theo ${groupLabels[filters.groupBy]}`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filters.metric === "risk"
                      ? "Bar chart điểm rủi ro TB theo ngày (kéo ngang) · đường trạng thái Cao/Theo dõi/Thấp · bảng số liệu có scroll dọc."
                      : null}
                  </p>
                  {filters.metric === "risk" ? (
                    <DailyStatusChart
                      points={data.chart.statusPoints || []}
                      riskPoints={data.chart.points || []}
                    />
                  ) : (
                    <SimpleChart
                      points={data.chart.points}
                      metric={data.chart.metric}
                    />
                  )}
                </div>
                <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Phân bố mức rủi ro</h2>
                  <DonutChart distribution={data.summary.riskDistribution} />
                </div>
              </section>
              {filters.className === "sim-179" &&
                (data.chart.activityPoints?.length > 0 ||
                  data.chart.participationPoints?.length > 0) && (
                <section className="mt-5 grid gap-5 lg:grid-cols-2">
                  {data.chart.activityPoints?.length > 0 && (
                    <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
                      <h2 className="font-semibold">
                        HS vào web theo ngày
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Số học sinh có hoạt động trên ThinkBridge trong ngày
                      </p>
                      <div className="mt-3">
                        <MetricBarScrollChart
                          points={data.chart.activityPoints}
                          title="Lượt HS hoạt động / ngày"
                          subtitle="Kéo ngang để xem thêm ngày"
                          barClassName="bg-amber-500"
                          trackClassName="bg-amber-100"
                          valueClassName="text-amber-700"
                        />
                      </div>
                    </div>
                  )}
                  {data.chart.participationPoints?.length > 0 && (
                    <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
                      <h2 className="font-semibold">
                        HS đã tham gia (lũy kế)
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Số học sinh đã bắt đầu dùng ThinkBridge tính đến từng ngày
                      </p>
                      <div className="mt-3">
                        <MetricBarScrollChart
                          points={data.chart.participationPoints}
                          title="Lũy kế học sinh tham gia"
                          subtitle="Kéo ngang để xem thêm ngày"
                          barClassName="bg-emerald-600"
                          trackClassName="bg-emerald-100"
                          valueClassName="text-emerald-700"
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}
              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Hành vi cần theo dõi</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Tổng hành vi trong bộ lọc hiện tại
                  </p>
                  <HorizontalBars items={data.breakdowns?.behaviors} />
                </div>
                <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Phân bố mức cải thiện</h2>
                  <SimpleChart
                    points={data.breakdowns?.improvement}
                    metric="students"
                  />
                </div>
              </section>
              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Rủi ro theo môn học</h2>
                  <StackedRiskBars
                    rows={data.breakdowns?.riskBySubject}
                    labelsByKey={subjectLabels}
                  />
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">Rủi ro theo cấp học</h2>
                  <StackedRiskBars
                    rows={data.breakdowns?.riskByEducationLevel}
                    labelsByKey={educationLabels}
                  />
                </div>
              </section>
              <section className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      {columns.map(([key, label]) => (
                        <th key={label} className="px-4 py-3">
                          {key ? (
                            <button
                              onClick={() => sort(key)}
                              className="font-semibold hover:text-seablue-700"
                            >
                              {label}
                              {mark(key)}
                            </button>
                          ) : (
                            label
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => openStudent(student.id)}
                        className="cursor-pointer border-t hover:bg-seablue-50"
                      >
                        <td className="px-4 py-3">
                          <strong>{student.name}</strong>
                          {student.username && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">
                                @{student.username}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3">{student.baselineScore}</td>
                        <td className="px-4 py-3 font-bold">
                          {student.behavioralRisk}
                        </td>
                        <td className="px-4 py-3 text-emerald-700">
                          -{student.improvement}
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge level={student.riskLevel} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-xs text-gray-600">
                          {student.recommendation}
                        </td>
                        <td className="px-4 py-3">{student.attemptRate}%</td>
                        <td className="px-4 py-3">{student.correctRate}%</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(student.latestActivity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t p-3 text-sm">
                  <span>
                    Trang {data.pagination.page}/{data.pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={data.pagination.page === 1}
                      onClick={() => update("page", data.pagination.page - 1)}
                      className="rounded border px-3 py-1 disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <button
                      disabled={
                        data.pagination.page === data.pagination.totalPages
                      }
                      onClick={() => update("page", data.pagination.page + 1)}
                      className="rounded border px-3 py-1 disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </section>
            </>
          )
        )}
      </div>
      <StudentDetail
        detail={detail}
        onClose={() => setDetail(null)}
        onAddNote={addNote}
      />
    </main>
  );
};
export default AdminDashboardPage;

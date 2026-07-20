import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate } from 'react-router-dom';
import { apiClient, get, post } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
const labels = {
  risk: 'Điểm rủi ro',
  hints: 'Số gợi ý',
  fullAnswers: 'Yêu cầu lời giải',
  attemptRate: 'Tỷ lệ tự thử',
  correctRate: 'Tỷ lệ đúng'
};
const subjectLabels = {
  mathematics: 'Toán',
  natural_sciences: 'KHTN',
  social_sciences: 'KHXH',
  english_language: 'Tiếng Anh',
  unclassified: 'Chưa phân loại'
};
const educationLabels = {
  elementary: 'Tiểu học',
  middle: 'THCS',
  high: 'THPT',
  unclassified: 'Chưa phân loại'
};
const riskLabels = {
  green: 'Thấp',
  yellow: 'Cần theo dõi',
  red: 'Cao'
};
const riskColors = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444'
};
const formatDate = value => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có';
const queryFor = (filters, extra = {}) => {
  const params = new URLSearchParams();
  Object.entries({
    ...filters,
    ...extra
  }).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) params.set(key, value);
  });
  return params.toString();
};
const RiskBadge = ({
  level
}) => <span className={`rounded-full px-2 py-1 text-xs font-semibold ${level === 'red' ? 'bg-red-100 text-red-800' : level === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{riskLabels[level] || 'Chưa rõ'}</span>;
const SourceBadge = ({
  source
}) => <span className={`text-xs ${source === 'demo' ? 'text-amber-700' : source === 'real' ? 'text-seablue-700' : 'text-gray-500'}`}>{source === 'demo' ? 'Mô phỏng' : source === 'real' ? 'Dữ liệu thật' : 'Mốc mặc định'}</span>;
const SimpleChart = ({
  points = [],
  metric
}) => {
  const max = Math.max(1, ...points.map(point => point.value));
  if (!points.length) return <p className="py-10 text-center text-sm text-gray-500">Chưa có event trong bộ lọc này.</p>;
  return <div className="mt-4 w-full max-w-full overflow-x-auto"><div className="flex min-w-max items-end gap-3 px-2 pt-6" style={{
      minHeight: 220
    }}>
    {points.map(point => <div key={point.label} className="flex w-16 flex-col items-center gap-2 text-center"><span className="text-xs font-semibold text-seablue-700">{point.value}{['attemptRate', 'correctRate'].includes(metric) ? '%' : ''}</span><div className="flex h-32 w-9 items-end rounded-t bg-seablue-100"><div className="w-full rounded-t bg-seablue-600" style={{
            height: `${Math.max(4, point.value * 100 / max)}%`
          }} /></div><span className="w-20 break-words text-[10px] text-gray-500">{point.label}</span></div>)}
  </div></div>;
};
const DonutChart = ({
  distribution
}) => {
  const total = Object.values(distribution || {}).reduce((sum, value) => sum + value, 0) || 1;
  const high = distribution?.red || 0;
  const watch = distribution?.yellow || 0;
  const low = distribution?.green || 0;
  let offset = 0;
  return <div className="space-y-5"><div className="flex flex-col items-center gap-4 sm:flex-row"><svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90" role="img" aria-label="Phân bố mức rủi ro">
    <circle cx="60" cy="60" r="46" fill="none" stroke="#e5e7eb" strokeWidth="18" />
    {['red', 'yellow', 'green'].map(level => {
          const value = distribution?.[level] || 0;
          const length = value / total * 289;
          const segment = <circle key={level} cx="60" cy="60" r="46" fill="none" stroke={riskColors[level]} strokeWidth="18" strokeDasharray={`${length} ${289 - length}`} strokeDashoffset={-offset} />;
          offset += length;
          return segment;
        })}
    <text x="60" y="56" textAnchor="middle" transform="rotate(90 60 60)" className="fill-gray-700 text-lg font-bold">{total}</text><text x="60" y="72" textAnchor="middle" transform="rotate(90 60 60)" className="fill-gray-500 text-[9px]">học sinh</text>
  </svg><div className="w-full space-y-3">{['red', 'yellow', 'green'].map(level => <div key={level} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{
              backgroundColor: riskColors[level]
            }} />{riskLabels[level]}</span><strong>{distribution?.[level] || 0} · {Math.round((distribution?.[level] || 0) * 100 / total)}%</strong></div>)}</div></div><div className="grid gap-4 border-t pt-4 sm:grid-cols-2"><div><h3 className="text-sm font-semibold">Ưu tiên can thiệp</h3><PieChart items={[{
          label: 'Cao',
          value: high,
          color: riskColors.red
        }, {
          label: 'Chưa khẩn cấp',
          value: watch + low,
          color: '#94a3b8'
        }]} /></div><div><h3 className="text-sm font-semibold">Nhóm cần theo dõi</h3><PieChart items={[{
          label: 'Cao + Theo dõi',
          value: high + watch,
          color: '#f97316'
        }, {
          label: 'Thấp',
          value: low,
          color: riskColors.green
        }]} /></div></div></div>;
};
const PieChart = ({
  items = [],
  colors = ['#0ea5b7', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
}) => {
  const values = items.filter(item => item.value > 0);
  const total = values.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <p className="py-8 text-center text-sm text-gray-500">Chưa có dữ liệu trong bộ lọc này.</p>;
  let start = 0;
  const segments = values.map((item, index) => {
    const end = start + item.value * 100 / total;
    const segment = `${item.color || colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  return <div className="mt-4 flex flex-col items-center gap-3"><div className="h-28 w-28 shrink-0 rounded-full shadow-inner" style={{
      background: `conic-gradient(${segments.join(', ')})`
    }} role="img" aria-label="Biểu đồ tròn" /><div className="w-full space-y-2">{values.map((item, index) => <div key={item.label} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{
            backgroundColor: item.color || colors[index % colors.length]
          }} />{item.label}</span><strong>{item.value} · {Math.round(item.value * 100 / total)}%</strong></div>)}</div></div>;
};
const TodayActivity = ({
  today
}) => <section className="mt-6 border-t pt-5"><div className="flex items-center justify-between"><h3 className="font-semibold">Hoạt động hôm nay</h3><strong className="rounded-full bg-seablue-50 px-3 py-1 text-sm text-seablue-700">{today.activeStudents} học sinh</strong></div><div className="mt-4 grid gap-5 sm:grid-cols-2"><div><h4 className="text-sm font-medium text-gray-600">Mức rủi ro hôm nay</h4><PieChart items={today.riskDistribution} /></div><div><h4 className="text-sm font-medium text-gray-600">Cơ cấu hành vi</h4><PieChart items={today.behaviors} /></div></div><div className="mt-4 space-y-2">{today.students.length ? today.students.map(student => <div key={student.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"><div><strong>{student.name}</strong>{student.username && <span className="ml-1 text-gray-500">@{student.username}</span>}<span className="ml-2 text-gray-500">· {student.behavior}</span></div><RiskBadge level={student.riskLevel} /></div>) : <p className="text-sm text-gray-500">Chưa có hoạt động trong hôm nay.</p>}</div></section>;
const HorizontalBars = ({
  items = []
}) => {
  const rows = Array.isArray(items) ? items : items.items || [];
  const max = Math.max(1, ...rows.map(item => item.value));
  return <><div className="mt-4 space-y-3">{rows.map(item => <div key={item.key || item.label}><div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><strong>{item.value}</strong></div><div className="h-3 overflow-hidden rounded bg-gray-100"><div className="h-full rounded bg-seablue-600" style={{
            width: `${item.value * 100 / max}%`
          }} /></div></div>)}</div>{items.today && <TodayActivity today={items.today} />}</>;
};
const StackedRiskBars = ({
  rows = [],
  labelsByKey
}) => {
  if (!rows.length) return <p className="py-8 text-center text-sm text-gray-500">Chưa có dữ liệu trong bộ lọc này.</p>;
  return <div className="mt-4 space-y-4">{rows.map(row => {
      const total = row.red + row.yellow + row.green || 1;
      return <div key={row.label}><div className="mb-1 flex justify-between text-sm"><span>{labelsByKey[row.label] || row.label}</span><strong>{total}</strong></div><div className="flex h-5 overflow-hidden rounded bg-gray-100">{['red', 'yellow', 'green'].map(level => row[level] ? <div key={level} title={`${riskLabels[level]}: ${row[level]}`} style={{
            width: `${row[level] * 100 / total}%`,
            backgroundColor: riskColors[level]
          }} /> : null)}</div></div>;
  })}</div>;
};
const dateInputValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const periodRange = period => {
  const end = new Date();
  const start = new Date(end);
  if (period === 'week') start.setDate(end.getDate() - (end.getDay() + 6) % 7);
  if (period === 'month') start.setDate(1);
  return { from: dateInputValue(start), to: dateInputValue(end) };
};
const QuickDateTabs = () => {
  const [selected, setSelected] = useState('month');
  const [target, setTarget] = useState(null);
  const options = [['today', 'Ngày hôm nay'], ['week', 'Tuần này'], ['month', 'Tháng này']];
  useEffect(() => {
    setTarget(document.querySelector('main > div > section'));
  }, []);
  const select = period => {
    setSelected(period);
    window.dispatchEvent(new CustomEvent('admin-date-range', { detail: periodRange(period) }));
  };
  if (!target) return null;
  return createPortal(<div className="col-span-full mt-1 flex w-fit rounded-xl border-2 border-emerald-300 bg-emerald-50 p-1 shadow-sm">{options.map(([value, label]) => <button key={value} onClick={() => select(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${selected === value ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-100'}`}>{label}</button>)}</div>, target);
};
const StudentDetail = ({
  detail,
  onClose,
  onAddNote
}) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  if (!detail) return <QuickDateTabs />;
  const {
    student
  } = detail;
  const submit = async event => {
    event.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    try {
      if (await onAddNote(student.id, note.trim())) setNote('');
    } finally {
      setSaving(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal="true"><section className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{student.name}</h2><p className="text-sm text-gray-500">{student.username && `@${student.username} · `}<SourceBadge source={student.source} /></p></div><button onClick={onClose} className="rounded-lg px-3 py-2 hover:bg-gray-100" aria-label="Đóng">✕</button></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Điểm đầu', student.baselineScore], ['Hiện tại', student.behavioralRisk], ['Đã giảm', `-${student.improvement}`], ['Tự thử', `${student.attemptRate}%`]].map(([label, value]) => <div key={label} className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>)}</div><div className="mt-3"><RiskBadge level={student.riskLevel} /> <span className="ml-2 text-sm text-gray-600">{student.recommendation}</span></div><div className="mt-6 rounded-xl border p-4"><h3 className="font-semibold">Xu hướng {labels[detail.chart.metric]}</h3><SimpleChart points={detail.chart.points} metric={detail.chart.metric} /></div><div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">{[['Gợi ý', student.hintRequests], ['Lời giải', student.fullAnswerRequests], ['Đúng', `${student.correctRate}%`], ['Can thiệp', student.gateCompletions]].map(([label, value]) => <div key={label} className="rounded-lg border p-3"><p className="text-gray-500">{label}</p><p className="text-lg font-bold">{value}</p></div>)}</div><div className="mt-6"><h3 className="font-semibold">Lịch sử quiz</h3><div className="mt-2 space-y-2">{detail.assessments.length ? detail.assessments.map((item, index) => <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm" key={`${item.submittedAt}-${index}`}><span>{formatDate(item.submittedAt)}</span><strong>{item.score}/48</strong></div>) : <p className="text-sm text-gray-500">Chưa làm quiz khi đăng nhập.</p>}</div></div><div className="mt-6"><h3 className="font-semibold">Ghi chú giáo viên</h3><form onSubmit={submit} className="mt-2"><textarea value={note} onChange={event => setNote(event.target.value)} maxLength="2000" rows="3" className="w-full rounded-lg border p-3" placeholder="Kế hoạch hoặc nhận xét can thiệp..." /><button disabled={!note.trim() || saving} className="mt-2 rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Thêm ghi chú'}</button></form><div className="mt-3 space-y-2">{detail.notes.map((item, index) => <div className="rounded-lg border p-3 text-sm" key={`${item.createdAt}-${index}`}><p>{item.body}</p><p className="mt-1 text-xs text-gray-500">{formatDate(item.createdAt)}</p></div>)}</div></div></section></div>;
};

// eslint-disable-next-line no-unused-vars
const LegacyAdminDashboardPage = () => {
  const {
    user
  } = useAuth();
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    educationLevel: '',
    subjectArea: '',
    riskLevel: '',
    search: '',
    metric: 'risk',
    groupBy: 'day',
    sortBy: 'behavioralRisk',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await get(`/admin/analytics?${queryFor(filters)}`);
      if (!response.ok) throw new Error('Không tải được dữ liệu dashboard');
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
  useEffect(() => {
    const applyRange = event => setFilters(current => ({ ...current, ...event.detail, page: 1 }));
    window.addEventListener('admin-date-range', applyRange);
    return () => window.removeEventListener('admin-date-range', applyRange);
  }, []);
  if (user?.role !== 'admin') return <Navigate to="/chat" replace />;
  const updateFilter = (key, value) => setFilters(current => ({
    ...current,
    [key]: value,
    page: key === 'page' ? value : 1
  }));
  const sortBy = key => setFilters(current => ({
    ...current,
    sortBy: key,
    sortOrder: current.sortBy === key && current.sortOrder === 'desc' ? 'asc' : 'desc',
    page: 1
  }));
  const openStudent = async id => {
    const response = await get(`/admin/students/${id}?${queryFor(filters, {
      page: undefined,
      limit: undefined,
      search: undefined
    })}`);
    if (response.ok) setDetail(await response.json());else setError('Không tải được hồ sơ học sinh');
  };
  const addNote = async (id, body) => {
    const response = await post(`/admin/students/${id}/notes`, {
      body
    });
    if (!response.ok) return setError('Không lưu được ghi chú');
    await openStudent(id);
    return true;
  };
  const exportCsv = async () => {
    const response = await apiClient(`/admin/analytics/export?${queryFor(filters, {
      page: undefined,
      limit: undefined
    })}`);
    if (!response.ok) return setError('Không xuất được CSV');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-dependency-analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  const columns = [['name', 'Học sinh'], ['source', 'Nguồn'], ['baselineScore', 'Điểm đầu'], ['behavioralRisk', 'Hiện tại'], ['improvement', 'Đã giảm'], ['riskLevel', 'Mức'], [null, 'Hành vi cần can thiệp'], ['attemptRate', 'Tự thử'], ['correctRate', 'Đúng'], ['latestActivity', 'Hoạt động']];
  const summaryCards = data ? [['Cần can thiệp ngay', data.summary.requiresIntervention, 'text-red-700'], ['Cần theo dõi', data.summary.watchingStudents, 'text-amber-700'], ['Đã cải thiện', data.summary.improvedStudents, 'text-emerald-700'], ['TB rủi ro', data.summary.averageBehavioralRisk, 'text-seablue-700'], ['Tổng học sinh', data.summary.totalStudents, 'text-gray-800']] : [];
  const sortMark = key => filters.sortBy === key ? filters.sortOrder === 'asc' ? ' ↑' : ' ↓' : '';
  return <main className="min-h-screen bg-gray-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Dashboard giáo viên</h1><p className="mt-1 text-sm text-gray-600">Ưu tiên học sinh có mức phụ thuộc AI cao và theo dõi tiến bộ học chủ động.</p></div><button onClick={exportCsv} className="rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white">Xuất CSV</button></div><section className="mt-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm">Từ ngày<input type="date" value={filters.from} onChange={event => updateFilter('from', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Đến ngày<input type="date" value={filters.to} onChange={event => updateFilter('to', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Môn<select value={filters.subjectArea} onChange={event => updateFilter('subjectArea', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(subjectLabels).filter(([key]) => key !== 'unclassified').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Mức rủi ro<select value={filters.riskLevel} onChange={event => updateFilter('riskLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(riskLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Cấp học<select value={filters.educationLevel} onChange={event => updateFilter('educationLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(educationLabels).filter(([key]) => key !== 'unclassified').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Chỉ số biểu đồ<select value={filters.metric} onChange={event => updateFilter('metric', event.target.value)} className="mt-1 w-full rounded border p-2">{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="text-sm">Nhóm theo<select value={filters.groupBy} onChange={event => updateFilter('groupBy', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="day">Ngày</option><option value="week">Tuần</option><option value="subject">Môn</option><option value="riskLevel">Mức rủi ro</option></select></label><label className="text-sm">Tìm học sinh<input value={filters.search} onChange={event => updateFilter('search', event.target.value)} className="mt-1 w-full rounded border p-2" placeholder="Tên hoặc username" /></label></section>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-16 text-center text-gray-500">Đang tải dữ liệu...</p> : data && <><>{data.summary.demoStudents > 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Đang hiển thị dữ liệu mô phỏng cho {data.summary.demoStudents} học sinh chưa có event thật. Dữ liệu này không tác động chat.</p>}</><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{summaryCards.map(([label, value, color]) => <div key={label} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p></div>)}</section><section className="mt-5 grid gap-5 lg:grid-cols-3"><div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-semibold">{labels[data.chart.metric]} theo {filters.groupBy === 'day' ? 'ngày' : filters.groupBy === 'week' ? 'tuần' : filters.groupBy === 'subject' ? 'môn' : 'mức rủi ro'}</h2><SimpleChart points={data.chart.points} metric={data.chart.metric} /></div><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Phân bố mức rủi ro</h2><DonutChart distribution={data.summary.riskDistribution} /></div></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Hành vi cần theo dõi</h2><p className="mt-1 text-sm text-gray-500">Tổng hành vi trong bộ lọc hiện tại</p><HorizontalBars items={data.breakdowns?.behaviors} /></div><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Phân bố mức cải thiện</h2><SimpleChart points={data.breakdowns?.improvement} metric="students" /></div></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Rủi ro theo môn học</h2><StackedRiskBars rows={data.breakdowns?.riskBySubject} labelsByKey={subjectLabels} /></div><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Rủi ro theo cấp học</h2><StackedRiskBars rows={data.breakdowns?.riskByEducationLevel} labelsByKey={educationLabels} /></div></section><section className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{columns.map(([key, label]) => <th key={label} className="px-4 py-3">{key ? <button onClick={() => sortBy(key)} className="font-semibold hover:text-seablue-700" title={`Sắp xếp theo ${label}`}>{label}{sortMark(key)}</button> : label}</th>)}</tr></thead><tbody>{data.students.map(student => <tr key={student.id} onClick={() => openStudent(student.id)} className="cursor-pointer border-t hover:bg-seablue-50"><td className="px-4 py-3"><strong>{student.name}</strong>{student.username && <><br /><span className="text-xs text-gray-500">@{student.username}</span></>}</td><td className="px-4 py-3"><SourceBadge source={student.source} /></td><td className="px-4 py-3">{student.baselineScore}</td><td className="px-4 py-3 font-bold">{student.behavioralRisk}</td><td className="px-4 py-3 text-emerald-700">-{student.improvement}</td><td className="px-4 py-3"><RiskBadge level={student.riskLevel} /></td><td className="max-w-xs px-4 py-3 text-xs text-gray-600">{student.recommendation}</td><td className="px-4 py-3">{student.attemptRate}%</td><td className="px-4 py-3">{student.correctRate}%</td><td className="px-4 py-3 text-xs text-gray-500">{formatDate(student.latestActivity)}</td></tr>)}</tbody></table><div className="flex items-center justify-between border-t p-3 text-sm"><span>Trang {data.pagination.page}/{data.pagination.totalPages}</span><div className="flex gap-2"><button disabled={data.pagination.page === 1} onClick={() => updateFilter('page', data.pagination.page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={data.pagination.page === data.pagination.totalPages} onClick={() => updateFilter('page', data.pagination.page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div></div></section></>}</div><StudentDetail detail={detail} onClose={() => setDetail(null)} onAddNote={addNote} /></main>;
};
const AdminDashboardPage = () => {
  const {
    user
  } = useAuth();
  const [filters, setFilters] = useState({
    from: periodRange('month').from,
    to: periodRange('month').to,
    educationLevel: '',
    subjectArea: '',
    riskLevel: '',
    search: '',
    metric: 'risk',
    groupBy: 'day',
    sortBy: 'behavioralRisk',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await get(`/admin/analytics?${queryFor(filters)}`);
      if (!response.ok) throw new Error('Không tải được dữ liệu dashboard');
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
  useEffect(() => {
    const applyRange = event => setFilters(current => ({ ...current, ...event.detail, page: 1 }));
    window.addEventListener('admin-date-range', applyRange);
    return () => window.removeEventListener('admin-date-range', applyRange);
  }, []);
  if (user?.role !== 'admin') return <Navigate to="/chat" replace />;
  const update = (key, value) => setFilters(current => ({
    ...current,
    [key]: value,
    page: key === 'page' ? value : 1
  }));
  const sort = sortBy => setFilters(current => ({
    ...current,
    sortBy,
    sortOrder: current.sortBy === sortBy && current.sortOrder === 'desc' ? 'asc' : 'desc',
    page: 1
  }));
  const openStudent = async id => {
    const response = await get(`/admin/students/${id}?${queryFor(filters, {
      page: undefined,
      limit: undefined,
      search: undefined
    })}`);
    if (response.ok) setDetail(await response.json());else setError('Không tải được hồ sơ học sinh');
  };
  const addNote = async (id, body) => {
    const response = await post(`/admin/students/${id}/notes`, {
      body
    });
    if (!response.ok) return setError('Không lưu được ghi chú');
    await openStudent(id);
    return true;
  };
  const exportCsv = async () => {
    const response = await apiClient(`/admin/analytics/export?${queryFor(filters, {
      page: undefined,
      limit: undefined
    })}`);
    if (!response.ok) return setError('Không xuất được CSV');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-dependency-analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  const columns = [['name', 'Học sinh'], ['source', 'Nguồn'], ['baselineScore', 'Điểm đầu'], ['behavioralRisk', 'Hiện tại'], ['improvement', 'Đã giảm'], ['riskLevel', 'Mức'], [null, 'Hành vi cần can thiệp'], ['attemptRate', 'Tự thử'], ['correctRate', 'Đúng'], ['latestActivity', 'Hoạt động']];
  const groupLabels = {
    day: 'ngày',
    week: 'tuần',
    month: 'tháng',
    subject: 'môn',
    riskLevel: 'mức rủi ro'
  };
  const mark = key => filters.sortBy === key ? filters.sortOrder === 'asc' ? ' ↑' : ' ↓' : '';
  const cards = data ? [['Cần can thiệp ngay', data.summary.requiresIntervention, 'text-red-700'], ['Cần theo dõi', data.summary.watchingStudents, 'text-amber-700'], ['Đã cải thiện', data.summary.improvedStudents, 'text-emerald-700'], ['TB rủi ro', data.summary.averageBehavioralRisk, 'text-seablue-700'], ['Tổng học sinh', data.summary.totalStudents, 'text-gray-800']] : [];
  return <main className="min-h-screen bg-gray-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Dashboard giáo viên</h1><p className="mt-1 text-sm text-gray-600">Ưu tiên can thiệp và theo dõi tiến bộ học chủ động.</p></div><button onClick={exportCsv} className="rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white">Xuất CSV</button></header><section className="mt-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm">Từ ngày<input type="date" value={filters.from} onChange={event => update('from', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Đến ngày<input type="date" value={filters.to} onChange={event => update('to', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Môn<select value={filters.subjectArea} onChange={event => update('subjectArea', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(subjectLabels).filter(([key]) => key !== 'unclassified').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Mức rủi ro<select value={filters.riskLevel} onChange={event => update('riskLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(riskLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Cấp học<select value={filters.educationLevel} onChange={event => update('educationLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option>{Object.entries(educationLabels).filter(([key]) => key !== 'unclassified').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Chỉ số biểu đồ<select value={filters.metric} onChange={event => update('metric', event.target.value)} className="mt-1 w-full rounded border p-2">{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm">Nhóm theo<select value={filters.groupBy} onChange={event => update('groupBy', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="day">Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option><option value="subject">Môn</option><option value="riskLevel">Mức rủi ro</option></select></label><label className="text-sm">Tìm học sinh<input value={filters.search} onChange={event => update('search', event.target.value)} className="mt-1 w-full rounded border p-2" placeholder="Tên hoặc username" /></label></section>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-16 text-center text-gray-500">Đang tải dữ liệu...</p> : data && <><>{data.summary.demoStudents > 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Đang hiển thị dữ liệu mô phỏng cho {data.summary.demoStudents} học sinh chưa có event thật. Dữ liệu này không tác động chat.</p>}</><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value, color]) => <div key={label} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p></div>)}</section><section className="mt-5 grid gap-5 lg:grid-cols-3"><div className="min-w-0 rounded-xl bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-semibold">{labels[data.chart.metric]} theo {groupLabels[filters.groupBy]}</h2><SimpleChart points={data.chart.points} metric={data.chart.metric} /></div><div className="min-w-0 rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Phân bố mức rủi ro</h2><DonutChart distribution={data.summary.riskDistribution} /></div></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Hành vi cần theo dõi</h2><p className="mt-1 text-sm text-gray-500">Tổng hành vi trong bộ lọc hiện tại</p><HorizontalBars items={data.breakdowns?.behaviors} /></div><div className="min-w-0 rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Phân bố mức cải thiện</h2><SimpleChart points={data.breakdowns?.improvement} metric="students" /></div></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Rủi ro theo môn học</h2><StackedRiskBars rows={data.breakdowns?.riskBySubject} labelsByKey={subjectLabels} /></div><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Rủi ro theo cấp học</h2><StackedRiskBars rows={data.breakdowns?.riskByEducationLevel} labelsByKey={educationLabels} /></div></section><section className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{columns.map(([key, label]) => <th key={label} className="px-4 py-3">{key ? <button onClick={() => sort(key)} className="font-semibold hover:text-seablue-700">{label}{mark(key)}</button> : label}</th>)}</tr></thead><tbody>{data.students.map(student => <tr key={student.id} onClick={() => openStudent(student.id)} className="cursor-pointer border-t hover:bg-seablue-50"><td className="px-4 py-3"><strong>{student.name}</strong>{student.username && <><br /><span className="text-xs text-gray-500">@{student.username}</span></>}</td><td className="px-4 py-3"><SourceBadge source={student.source} /></td><td className="px-4 py-3">{student.baselineScore}</td><td className="px-4 py-3 font-bold">{student.behavioralRisk}</td><td className="px-4 py-3 text-emerald-700">-{student.improvement}</td><td className="px-4 py-3"><RiskBadge level={student.riskLevel} /></td><td className="max-w-xs px-4 py-3 text-xs text-gray-600">{student.recommendation}</td><td className="px-4 py-3">{student.attemptRate}%</td><td className="px-4 py-3">{student.correctRate}%</td><td className="px-4 py-3 text-xs text-gray-500">{formatDate(student.latestActivity)}</td></tr>)}</tbody></table><div className="flex items-center justify-between border-t p-3 text-sm"><span>Trang {data.pagination.page}/{data.pagination.totalPages}</span><div className="flex gap-2"><button disabled={data.pagination.page === 1} onClick={() => update('page', data.pagination.page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={data.pagination.page === data.pagination.totalPages} onClick={() => update('page', data.pagination.page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div></div></section></>}</div><StudentDetail detail={detail} onClose={() => setDetail(null)} onAddNote={addNote} /></main>;
};
export default AdminDashboardPage;

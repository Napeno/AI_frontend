import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient, get, post } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

const labels = {
  risk: 'Điểm hành vi',
  hints: 'Số gợi ý',
  fullAnswers: 'Yêu cầu lời giải',
  attemptRate: 'Tỷ lệ tự thử',
  correctRate: 'Tỷ lệ đúng',
};

const formatDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có';

const queryFor = (filters, extra = {}) => {
  const params = new URLSearchParams();
  Object.entries({ ...filters, ...extra }).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) params.set(key, value);
  });
  return params.toString();
};

const RiskBadge = ({ level }) => {
  const styles = {
    green: 'bg-emerald-100 text-emerald-800',
    yellow: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
  };
  const names = { green: 'Thấp', yellow: 'Cần theo dõi', red: 'Cao' };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[level] || styles.green}`}>{names[level] || names.green}</span>;
};

const SimpleChart = ({ points = [], metric }) => {
  const max = Math.max(1, ...points.map(point => point.value));
  return (
    <div className="mt-4 overflow-x-auto">
      {points.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">Chưa có sự kiện trong bộ lọc này.</p> : (
        <div className="flex min-w-max items-end gap-3 px-2 pt-6" style={{ minHeight: 220 }}>
          {points.map(point => (
            <div key={point.label} className="flex w-16 flex-col items-center gap-2 text-center">
              <span className="text-xs font-semibold text-seablue-700">{point.value}{['attemptRate', 'correctRate'].includes(metric) ? '%' : ''}</span>
              <div className="flex h-32 w-9 items-end rounded-t bg-seablue-100">
                <div className="w-full rounded-t bg-seablue-600 transition-all" style={{ height: `${Math.max(4, point.value * 100 / max)}%` }} />
              </div>
              <span className="w-20 break-words text-[10px] text-gray-500">{point.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StudentDetail = ({ detail, onClose, onAddNote }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  if (!detail) return null;
  const student = detail.student;
  const submit = async (event) => {
    event.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    try {
      if (await onAddNote(student.id, note.trim())) setNote('');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal="true">
      <section className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-bold text-gray-900">{student.name}</h2><p className="text-sm text-gray-500">@{student.username}</p></div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" aria-label="Đóng">✕</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-seablue-50 p-3"><p className="text-xs text-gray-500">Điểm hành vi</p><p className="text-2xl font-bold text-seablue-700">{student.behavioralRisk}</p><RiskBadge level={student.riskLevel} /></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Quiz gần nhất</p><p className="text-2xl font-bold">{student.quiz?.score ?? '—'}</p><p className="text-xs text-gray-500">/48</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Tự thử</p><p className="text-2xl font-bold">{student.attemptRate}%</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Tỷ lệ đúng</p><p className="text-2xl font-bold">{student.correctRate}%</p></div>
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 p-4"><h3 className="font-semibold">Xu hướng {labels[detail.chart.metric]}</h3><SimpleChart points={detail.chart.points} metric={detail.chart.metric} /></div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[["Gợi ý", student.hintRequests], ["Gợi ý nhanh", student.rapidHintRequests], ["Lời giải", student.fullAnswerRequests], ["Can thiệp", student.gateCompletions]].map(([label, value]) => <div key={label} className="rounded-lg border p-3"><p className="text-gray-500">{label}</p><p className="text-lg font-bold">{value}</p></div>)}
        </div>
        <div className="mt-6"><h3 className="font-semibold">Lịch sử quiz</h3><div className="mt-2 space-y-2">{detail.assessments.length ? detail.assessments.map((assessment, index) => <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm" key={`${assessment.submittedAt}-${index}`}><span>{formatDate(assessment.submittedAt)}</span><strong>{assessment.score}/48</strong></div>) : <p className="text-sm text-gray-500">Chưa làm quiz khi đăng nhập.</p>}</div></div>
        <div className="mt-6"><h3 className="font-semibold">Ghi chú giáo viên</h3><form onSubmit={submit} className="mt-2"><textarea value={note} onChange={event => setNote(event.target.value)} maxLength="2000" rows="3" className="w-full rounded-lg border p-3" placeholder="Kế hoạch hoặc nhận xét can thiệp..." /><button disabled={!note.trim() || saving} className="mt-2 rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Thêm ghi chú'}</button></form><div className="mt-3 space-y-2">{detail.notes.map((item, index) => <div className="rounded-lg border p-3 text-sm" key={`${item.createdAt}-${index}`}><p>{item.body}</p><p className="mt-1 text-xs text-gray-500">{formatDate(item.createdAt)}</p></div>)}</div></div>
      </section>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ from: '', to: '', educationLevel: '', subjectArea: '', riskLevel: '', search: '', metric: 'risk', groupBy: 'day', page: 1, limit: 20 });
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

  useEffect(() => { load(); }, [load]);
  if (user?.role !== 'admin') return <Navigate to="/chat" replace />;

  const updateFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  const openStudent = async (id) => {
    try {
      const response = await get(`/admin/students/${id}?${queryFor(filters, { page: undefined, limit: undefined, search: undefined })}`);
      if (!response.ok) throw new Error('Không tải được hồ sơ học sinh');
      setDetail(await response.json());
    } catch (detailError) { setError(detailError.message); }
  };
  const addNote = async (id, body) => {
    const response = await post(`/admin/students/${id}/notes`, { body });
    if (!response.ok) {
      setError('Không lưu được ghi chú');
      return false;
    }
    await openStudent(id);
    return true;
  };
  const exportCsv = async () => {
    const response = await apiClient(`/admin/analytics/export?${queryFor(filters, { page: undefined, limit: undefined })}`);
    if (!response.ok) return setError('Không xuất được CSV');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url; link.download = 'student-dependency-analytics.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  return <main className="min-h-screen bg-gray-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">Dashboard giáo viên</h1><p className="mt-1 text-sm text-gray-600">Theo dõi hành vi sử dụng AI và quiz tự đánh giá của học sinh.</p></div><button onClick={exportCsv} className="rounded-lg bg-seablue-600 px-4 py-2 text-sm font-semibold text-white">Xuất CSV</button></div>
    <section className="mt-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm">Từ ngày<input type="date" value={filters.from} onChange={event => updateFilter('from', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Đến ngày<input type="date" value={filters.to} onChange={event => updateFilter('to', event.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Môn<select value={filters.subjectArea} onChange={event => updateFilter('subjectArea', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option><option value="mathematics">Toán</option><option value="natural_sciences">KHTN</option><option value="social_sciences">KHXH</option><option value="english_language">Tiếng Anh</option></select></label><label className="text-sm">Mức rủi ro<select value={filters.riskLevel} onChange={event => updateFilter('riskLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option><option value="green">Thấp</option><option value="yellow">Cần theo dõi</option><option value="red">Cao</option></select></label><label className="text-sm">Cấp học<select value={filters.educationLevel} onChange={event => updateFilter('educationLevel', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Tất cả</option><option value="elementary">Tiểu học</option><option value="middle">THCS</option><option value="high">THPT</option></select></label><label className="text-sm">Chỉ số biểu đồ<select value={filters.metric} onChange={event => updateFilter('metric', event.target.value)} className="mt-1 w-full rounded border p-2">{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="text-sm">Nhóm theo<select value={filters.groupBy} onChange={event => updateFilter('groupBy', event.target.value)} className="mt-1 w-full rounded border p-2"><option value="day">Ngày</option><option value="week">Tuần</option><option value="subject">Môn</option><option value="riskLevel">Mức rủi ro</option></select></label><label className="text-sm">Tìm học sinh<input value={filters.search} onChange={event => updateFilter('search', event.target.value)} className="mt-1 w-full rounded border p-2" placeholder="Tên hoặc username" /></label></section>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-16 text-center text-gray-500">Đang tải dữ liệu...</p> : data && <><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Học sinh", data.summary.totalStudents], ["Đang hoạt động", data.summary.activeStudents], ["TB hành vi", data.summary.averageBehavioralRisk], ["Quiz TB", data.summary.averageQuizScore ?? '—'], ["Rủi ro cao", data.summary.riskDistribution.red]].map(([label, value]) => <div key={label} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-3xl font-bold text-seablue-700">{value}</p></div>)}</section><section className="mt-5 grid gap-5 lg:grid-cols-3"><div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-semibold">{labels[data.chart.metric]} theo {filters.groupBy === 'day' ? 'ngày' : filters.groupBy === 'week' ? 'tuần' : filters.groupBy === 'subject' ? 'môn' : 'mức rủi ro'}</h2><SimpleChart points={data.chart.points} metric={data.chart.metric} /></div><div className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Phân bố rủi ro</h2><div className="mt-5 space-y-4">{['green', 'yellow', 'red'].map(level => <div key={level}><div className="mb-1 flex justify-between text-sm"><RiskBadge level={level} /><span>{data.summary.riskDistribution[level]}</span></div><div className="h-3 rounded bg-gray-100"><div className={level === 'red' ? 'h-full rounded bg-red-500' : level === 'yellow' ? 'h-full rounded bg-amber-400' : 'h-full rounded bg-emerald-500'} style={{ width: `${data.summary.totalStudents ? data.summary.riskDistribution[level] * 100 / data.summary.totalStudents : 0}%` }} /></div></div>)}</div></div></section><section className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Học sinh', 'Hành vi', 'Quiz', 'Chat', 'Gợi ý', 'Lời giải', 'Tự thử', 'Đúng', 'Can thiệp', 'Hoạt động'].map(header => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{data.students.map(student => <tr key={student.id} onClick={() => openStudent(student.id)} className="cursor-pointer border-t hover:bg-seablue-50"><td className="px-4 py-3"><strong>{student.name}</strong><br /><span className="text-xs text-gray-500">@{student.username}</span></td><td className="px-4 py-3"><strong>{student.behavioralRisk}</strong><br /><RiskBadge level={student.riskLevel} /></td><td className="px-4 py-3">{student.quiz?.score ?? '—'}{student.quiz && '/48'}</td><td className="px-4 py-3">{student.conversations}</td><td className="px-4 py-3">{student.hintRequests} <span className="text-xs text-gray-500">({student.rapidHintRequests} nhanh)</span></td><td className="px-4 py-3">{student.fullAnswerRequests}</td><td className="px-4 py-3">{student.attemptRate}%</td><td className="px-4 py-3">{student.correctRate}%</td><td className="px-4 py-3">{student.gateCompletions}</td><td className="px-4 py-3 text-xs text-gray-500">{formatDate(student.latestActivity)}</td></tr>)}</tbody></table>{data.students.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Không có học sinh phù hợp.</p>}<div className="flex items-center justify-between border-t p-3 text-sm"><span>Trang {data.pagination.page}/{data.pagination.totalPages}</span><div className="flex gap-2"><button disabled={data.pagination.page === 1} onClick={() => updateFilter('page', data.pagination.page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button><button disabled={data.pagination.page === data.pagination.totalPages} onClick={() => updateFilter('page', data.pagination.page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button></div></div></section></>}
  </div><StudentDetail detail={detail} onClose={() => setDetail(null)} onAddNote={addNote} /></main>;
};

export default AdminDashboardPage;

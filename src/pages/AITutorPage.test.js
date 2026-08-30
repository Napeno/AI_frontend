import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AITutorPage from './AITutorPage';
import { post } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

jest.mock('../utils/apiClient', () => ({ post: jest.fn() }));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const response = body => ({ ok: true, json: async () => body });

const step = {
  id: 's1',
  title: 'Bước 1',
  explanation: 'Tách dữ kiện.',
  blanks: [{ id: 'b1', label: 'Kết quả' }],
  tokens: [{ id: 't1', label: '4', type: 'number' }],
  interaction: null,
};

const makeLesson = ({ index = 0, stepIndex = -1, correctOptionId } = {}) => ({
  lessonId: 'lesson-1',
  sessionId: 'session-1',
  sourceQuestionId: 'q1',
  sourceText: 'Bài toán mẫu',
  sourceImage: null,
  currentQuestionIndex: index,
  currentStepIndex: stepIndex,
  completed: false,
  question: {
    id: `q${index + 1}`,
    title: `Câu ${index + 1}`,
    prompt: 'Chọn kết quả đúng.',
    visual: { kind: 'none' },
    interactionType: 'math_tokens',
    options: [
      { id: 'A', text: 'Bốn' },
      { id: 'B', text: 'Năm' },
      { id: 'C', text: 'Sáu' },
      { id: 'D', text: 'Bảy' },
    ],
    ...(correctOptionId ? { correctOptionId } : {}),
    tutorSteps: [step, { ...step, id: 's2', title: 'Bước 2' }],
  },
});

const renderTutor = () => render(
  <MemoryRouter initialEntries={['/ai-tutor/session-1']}>
    <Routes>
      <Route path="/ai-tutor/:sessionId" element={<AITutorPage />} />
    </Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ updateUserChestnuts: jest.fn() });
});

test('keeps the tutor locked until an answer is submitted', async () => {
  post.mockResolvedValue(response({ lesson: makeLesson() }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  expect(screen.queryByRole('button', { name: /Trả lời/ })).not.toBeInTheDocument();
  expect(screen.getAllByText('🔒')).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  expect(screen.getByRole('button', { name: /Trả lời/ })).toBeInTheDocument();
  expect(post).toHaveBeenCalledTimes(1);
  expect(screen.getAllByText('🔒')).toHaveLength(2);
});

test('reveals the correct answer and wrong-answer guidance only after submit', async () => {
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: false,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'B' }),
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  await waitFor(() => expect(screen.getByText('Chưa đúng. Hãy thử lại.')).toBeInTheDocument());
  expect(screen.getAllByText('Tách dữ kiện.').length).toBeGreaterThan(0);
  expect(screen.getByAltText('StudentAI')).toBeInTheDocument();
  expect(screen.getByText('Kết quả')).toBeInTheDocument();
  expect(screen.getAllByText('🔒')).toHaveLength(1);
});

test('shows praise after a correct submitted answer', async () => {
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: true,
      message: 'Chính xác! Mở bước tiếp theo nhé.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'A' }),
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  await waitFor(() => expect(screen.getByText('Chính xác! Mở bước tiếp theo nhé.')).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /Câu tiếp theo/ })).toBeInTheDocument();
});

test('normalizes repeated tutor step titles and shows one active step', async () => {
  const repeatedStep = { ...step, title: 'Bước 1 · Xác định dữ kiện' };
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: false,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: {
        ...makeLesson({ stepIndex: 0, correctOptionId: 'B' }),
        question: {
          ...makeLesson({ stepIndex: 0, correctOptionId: 'B' }).question,
          tutorSteps: [repeatedStep, { ...repeatedStep, id: 's2' }],
        },
      },
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  await waitFor(() => expect(screen.getByText('Chưa đúng. Hãy thử lại.')).toBeInTheDocument());
  expect(screen.getAllByRole('heading', { name: /^Bước [12]$/ })).toHaveLength(2);
  expect(screen.queryByText('Bước 1 · Xác định dữ kiện')).not.toBeInTheDocument();
  expect(screen.getByText('Kết quả')).toBeInTheDocument();
  expect(screen.getAllByText('🔒')).toHaveLength(1);
});

test('awards points, updates auth state, and bursts confetti on a first correct answer', async () => {
  const updateUserChestnuts = jest.fn();
  useAuth.mockReturnValue({ updateUserChestnuts });
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: true,
      pointsAwarded: 25,
      totalPoints: 125,
      chestnutsAwarded: 5,
      totalChestnuts: 15,
      currentRank: 'silver',
      message: 'Chính xác! Mở bước tiếp theo nhé.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'A' }),
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  await waitFor(() => expect(screen.getByText('+25 điểm · +5 hạt dẻ')).toBeInTheDocument());
  expect(updateUserChestnuts).toHaveBeenCalledWith(15, 125);
  expect(document.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(36);
});

test('does not show reward or update auth state for an incorrect answer', async () => {
  const updateUserChestnuts = jest.fn();
  useAuth.mockReturnValue({ updateUserChestnuts });
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: false,
      pointsAwarded: 0,
      chestnutsAwarded: 0,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'B' }),
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  await waitFor(() => expect(screen.getByText('Chưa đúng. Hãy thử lại.')).toBeInTheDocument());
  expect(screen.queryByText(/điểm ·/)).not.toBeInTheDocument();
  expect(updateUserChestnuts).not.toHaveBeenCalled();
  expect(document.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(0);
});

test('uses the previous-question endpoint and locks the returned question', async () => {
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson({ index: 1 }) }))
    .mockResolvedValueOnce(response({ lesson: makeLesson() }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /Câu trước/ }));

  await waitFor(() => expect(post).toHaveBeenLastCalledWith('/ai-tutor/lessons/lesson-1/previous', {}));
  expect(screen.getAllByText('🔒')).toHaveLength(2);
});

test('shows a recoverable message when the API lesson has no active question', async () => {
  post.mockResolvedValue(response({ lesson: { lessonId: 'lesson-1', currentQuestionIndex: 0, questions: [] } }));
  renderTutor();

  expect(await screen.findByText('Chưa tải được câu hỏi luyện tập.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Về Chat/ })).toBeInTheDocument();
});

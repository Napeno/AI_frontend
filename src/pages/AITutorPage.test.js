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

const guidance = {
  analysis: 'Phân tích: chọn công thức phù hợp.',
  easierExample: { prompt: 'Ví dụ dễ hơn: (a + 1)².', answer: 'a² + 2a + 1', hint: 'Ghép đủ ba phần.' },
};

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
  expect(screen.getByRole('button', { name: 'Kết quả: Ô trống' })).toBeInTheDocument();
  expect(screen.getAllByText('🔒')).toHaveLength(1);
});

test('shows a simple white blank target for wrong-answer guidance', async () => {
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

  await waitFor(() => expect(screen.getByRole('button', { name: 'Kết quả: Ô trống' })).toHaveStyle({ backgroundColor: '#fff' }));
  expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
});

test('shows the correct blank answer and advances after review', async () => {
  const nextLesson = {
    ...makeLesson({ stepIndex: 1, correctOptionId: 'B' }),
    question: {
      ...makeLesson({ stepIndex: 1, correctOptionId: 'B' }).question,
      tutorSteps: [step, { ...step, id: 's2', explanation: 'Hướng dẫn bước hai.' }],
    },
  };
  const lessonWithWrongToken = {
    ...makeLesson({ stepIndex: 0 }),
    question: {
      ...makeLesson().question,
      tutorSteps: [{ ...step, tokens: [step.tokens[0], { id: 't2', label: '9', type: 'number' }] }, { ...step, id: 's2' }],
    },
  };
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: false,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: lessonWithWrongToken,
    }))
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        correct: false,
        error: 'Câu trả lời chưa đúng. Đáp án đúng ở bên dưới.',
        correctAnswer: [{ blankId: 'b1', label: '4' }],
        guidance: 'Tính 2 × 2 × a để tìm số hạng giữa.',
        lesson: lessonWithWrongToken,
      }),
    })
    .mockResolvedValueOnce(response({ lesson: nextLesson }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));
  const blank = await screen.findByRole('button', { name: 'Kết quả: Ô trống' });
  fireEvent.click(screen.getByRole('button', { name: '9' }));
  fireEvent.click(blank);
  fireEvent.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

  expect(await screen.findByText('Đáp án đúng: 4')).toBeInTheDocument();
  expect(screen.getByText('Hướng dẫn: Tính 2 × 2 × a để tìm số hạng giữa.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
  await waitFor(() => expect(post).toHaveBeenLastCalledWith('/ai-tutor/lessons/lesson-1/step', {
    questionId: 'q1',
    stepId: 's1',
    placements: {},
    interactionAnswer: { stepReview: true },
  }));
  expect(screen.queryByText('Tách dữ kiện.')).not.toBeInTheDocument();
  expect(await screen.findByText('Hướng dẫn bước hai.')).toBeInTheDocument();
});

test('scrolls the active guidance area into view after a wrong answer', async () => {
  const scrollIntoView = jest.fn();
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = scrollIntoView;
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: false,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'B' }),
    }));

  try {
    renderTutor();
    await screen.findByText('Chọn kết quả đúng.');
    fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
    fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' }));
  } finally {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  }
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
  expect(screen.getByRole('button', { name: /A\. Bốn/ })).toHaveClass('border-green-700', 'bg-green-600', 'text-white');
  expect(screen.getByText('Chính xác! Mở bước tiếp theo nhé.').parentElement).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-800');
});

test('shows AI analysis and an easier example in the opened guidance card', async () => {
  post
    .mockResolvedValueOnce(response({ lesson: { ...makeLesson(), question: { ...makeLesson().question, tutorSteps: [{ ...step, ...guidance }, { ...step, id: 's2', title: 'Bước 2' }] } } }))
    .mockResolvedValueOnce(response({
      correct: true,
      pointsAwarded: 25,
      totalPoints: 125,
      chestnutsAwarded: 5,
      totalChestnuts: 15,
      message: 'Chính xác! Mở bước tiếp theo nhé.',
      lesson: { ...makeLesson({ stepIndex: 0, correctOptionId: 'A' }), question: { ...makeLesson({ stepIndex: 0, correctOptionId: 'A' }).question, tutorSteps: [{ ...step, ...guidance }, { ...step, id: 's2', title: 'Bước 2' }] } },
    }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));

  const moreGuidance = await screen.findByText('Gợi ý thêm');
  fireEvent.click(moreGuidance);
  expect(screen.getByText('Phân tích:')).toBeInTheDocument();
  expect(screen.getByText('Ví dụ dễ hơn:')).toBeInTheDocument();
  expect(screen.queryByText(/token/i)).not.toBeInTheDocument();
});

test('collapses the completed step and opens the next step', async () => {
  const lessonWithSteps = stepIndex => ({
    ...makeLesson({ stepIndex }),
    question: {
      ...makeLesson({ stepIndex }).question,
      tutorSteps: [step, { ...step, id: 's2', title: 'Bước 2', explanation: 'Hướng dẫn bước hai.' }],
    },
  });
  post
    .mockResolvedValueOnce(response({ lesson: lessonWithSteps(-1) }))
    .mockResolvedValueOnce(response({
      correct: false,
      message: 'Chưa đúng. Hãy thử lại.',
      lesson: lessonWithSteps(0),
    }))
    .mockResolvedValueOnce(response({ lesson: lessonWithSteps(1) }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));
  const blank = await screen.findByRole('button', { name: 'Kết quả: Ô trống' });
  fireEvent.click(screen.getByRole('button', { name: '4' }));
  fireEvent.click(blank);
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

  expect(await screen.findByText('Hướng dẫn bước hai.')).toBeInTheDocument();
  expect(screen.getByText('Tốt lắm, tiếp tục nhé.').parentElement).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-800');
  expect(screen.queryByText('Tách dữ kiện.')).not.toBeInTheDocument();
  expect(screen.queryAllByText('🔒')).toHaveLength(0);
});

test('moves to the next question directly after a correct answer', async () => {
  post
    .mockResolvedValueOnce(response({ lesson: makeLesson() }))
    .mockResolvedValueOnce(response({
      correct: true,
      pointsAwarded: 25,
      totalPoints: 125,
      chestnutsAwarded: 5,
      totalChestnuts: 15,
      message: 'Chính xác! Mở bước tiếp theo nhé.',
      lesson: makeLesson({ stepIndex: 0, correctOptionId: 'A' }),
    }))
    .mockResolvedValueOnce(response({ lesson: makeLesson({ index: 1 }) }));
  renderTutor();

  await screen.findByText('Chọn kết quả đúng.');
  fireEvent.click(screen.getByRole('button', { name: /A\. Bốn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Trả lời/ }));
  const continueButton = await screen.findByRole('button', { name: /Câu tiếp theo/ });
  fireEvent.click(continueButton);

  await waitFor(() => expect(post).toHaveBeenLastCalledWith('/ai-tutor/lessons/lesson-1/step', {
    questionId: 'q1',
    stepId: 's1',
    placements: {},
    interactionAnswer: { skip: true },
  }));
  expect(await screen.findByRole('heading', { name: 'Câu 2' })).toBeInTheDocument();
  expect(screen.getAllByText('🔒')).toHaveLength(2);
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
  expect(screen.getByRole('button', { name: 'Kết quả: Ô trống' })).toBeInTheDocument();
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
  expect(document.querySelectorAll('.animate-confetti-fall')).toHaveLength(0);
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

test('shows the Vietnamese API error when the source conversation is missing', async () => {
  post.mockResolvedValue({ ok: false, json: async () => ({ error: 'Không tìm thấy cuộc trò chuyện.' }) });
  renderTutor();

  expect(await screen.findByText('Không tìm thấy cuộc trò chuyện.')).toBeInTheDocument();
  expect(screen.queryByText('Conversation not found')).not.toBeInTheDocument();
});

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PracticePage from './PracticePage';
import { get, post } from '../utils/apiClient';

jest.mock('../utils/apiClient', () => ({ del: jest.fn(), get: jest.fn(), post: jest.fn() }));
jest.mock('../locales/i18n', () => ({ getLanguage: () => 'vi' }));
jest.mock('../utils/chatUtils', () => ({ formatAIMessage: value => value }));

const item = {
  id: 'item-1',
  conversationTitle: 'Giúp em giải phương trình',
  sourceQuestion: '2x + 3 = 9',
  blocker: 'calculation',
  subjectArea: 'mathematics',
  status: 'new',
  reviewCount: 0,
  practice: { prompt: 'Tính một biểu thức mới.', hint: 'Làm từng phép tính.', turns: [], incorrectAttempts: 0 },
  variants: [{ questionType: 'long_answer', prompt: 'Tính một biểu thức mới.', hint: 'Làm từng phép tính.', turns: [], incorrectAttempts: 0, canShowSolution: false }],
  canShowSolution: false,
};

const response = (body) => ({ ok: true, json: async () => body });

beforeEach(() => {
  jest.clearAllMocks();
  get.mockImplementation(url => {
    if (url.startsWith('/practice/recommendation')) return Promise.resolve(response({ recommendation: item }));
    return Promise.resolve(response({
      items: [item],
      subjects: ['mathematics'],
      pagination: { page: url.includes('page=2') ? 2 : 1, totalPages: 2, totalItems: 7 },
    }));
  });
});

test('shows the conversation title and the original math problem in the notebook', async () => {
  render(<MemoryRouter><PracticePage /></MemoryRouter>);

  expect((await screen.findAllByText('Giúp em giải phương trình')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Vấn đề: 2x + 3 = 9').length).toBeGreaterThan(0);
});

test('paginates saved items and sends an attempt as an interaction', async () => {
  post.mockImplementation(url => {
    if (url.endsWith('/generate')) return Promise.resolve(response({ item }));
    return Promise.resolve(response({
    action: 'attempt',
    isCorrect: true,
    pointsAwarded: 25,
    chestnutsAwarded: 5,
    totalChestnuts: 10,
    totalPoints: 125,
    item: {
        ...item,
      variants: [{
        ...item.variants[0],
        turns: [
          { role: 'student', action: 'attempt', content: 'Em tính 3 + 4', createdAt: '2026-07-20T00:00:00.000Z' },
          { role: 'assistant', action: 'attempt', content: 'Chính xác!', isCorrect: true, createdAt: '2026-07-20T00:00:01.000Z' },
        ],
      }],
      },
    }));
  });

  render(<MemoryRouter><PracticePage /></MemoryRouter>);

  fireEvent.click(await screen.findByRole('button', { name: /Tự luận dài/i }));
  await screen.findByText('Tính một biểu thức mới.');
  expect(screen.getByRole('button', { name: /Gợi ý thêm/i })).toBeDisabled();
  expect(screen.queryByText('Làm từng phép tính.')).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Viết bước làm hoặc cách nghĩ của em...'), { target: { value: 'Em tính 3 + 4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));

  await waitFor(() => expect(post).toHaveBeenCalledWith('/practice/items/item-1/attempt', expect.objectContaining({
    action: 'attempt',
    questionType: 'long_answer',
    answer: 'Em tính 3 + 4',
    language: 'vi',
  })));
  expect(await screen.findByRole('button', { name: /Câu tiếp theo/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Chọn loại câu hỏi khác/ })).toBeInTheDocument();
  expect(screen.getByAltText('Trả lời đúng')).toBeInTheDocument();
  await waitFor(() => expect(document.querySelector('.reward-celebration-message')).toHaveTextContent('+25 điểm'));

  fireEvent.click(screen.getByRole('button', { name: 'Sau →' }));
  await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining('/practice/items?page=2&limit=6')));
});

test('starts a new question or returns to question type selection after an attempt', async () => {
  const attemptedItem = {
    ...item,
    variants: [{
      ...item.variants[0],
      turns: [
        { role: 'student', action: 'attempt', content: 'Em tính 3 + 4' },
        { role: 'assistant', action: 'attempt', content: 'Chưa đúng.', isCorrect: false },
      ],
    }],
  };
  const newQuestionItem = {
    ...item,
    variants: [{ ...item.variants[0], prompt: 'Câu tiếp theo mới.', turns: [] }],
  };
  let generateCount = 0;
  post.mockImplementation(url => {
    if (url.endsWith('/attempt')) return Promise.resolve(response({ action: 'attempt', item: attemptedItem }));
    generateCount += 1;
    return Promise.resolve(response({ questionType: 'long_answer', item: generateCount === 1 ? item : newQuestionItem }));
  });

  render(<MemoryRouter><PracticePage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /Tự luận dài/i }));
  await screen.findByText('Tính một biểu thức mới.');
  fireEvent.change(screen.getByPlaceholderText('Viết bước làm hoặc cách nghĩ của em...'), { target: { value: 'Em tính 3 + 4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
  await screen.findByRole('button', { name: /Câu tiếp theo/ });
  expect(screen.getByAltText('Trả lời chưa đúng')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo/ }));
  await waitFor(() => expect(post).toHaveBeenLastCalledWith('/practice/items/item-1/generate', {
    questionType: 'long_answer',
    language: 'vi',
  }));
  expect(await screen.findByText('Câu tiếp theo mới.')).toBeInTheDocument();
});

test('returns to question type selection after an attempt', async () => {
  const attemptedItem = {
    ...item,
    variants: [{ ...item.variants[0], turns: [{ role: 'student', action: 'attempt', content: 'Em tính 3 + 4' }] }],
  };
  post.mockImplementation(url => {
    if (url.endsWith('/generate')) return Promise.resolve(response({ item }));
    return Promise.resolve(response({ action: 'attempt', item: attemptedItem }));
  });

  render(<MemoryRouter><PracticePage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /Tự luận dài/i }));
  await screen.findByText('Tính một biểu thức mới.');
  fireEvent.change(screen.getByPlaceholderText('Viết bước làm hoặc cách nghĩ của em...'), { target: { value: 'Em tính 3 + 4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
  fireEvent.click(await screen.findByRole('button', { name: /Chọn loại câu hỏi khác/ }));

  expect(await screen.findByText('Chọn dạng bài ôn')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /Trắc nghiệm nhiều lựa chọn/i }).length).toBeGreaterThan(0);
});

test('generates a selected practice type only when its button is clicked', async () => {
  const emptyPracticeItem = { ...item, practice: null, variants: [] };
  get.mockImplementation(url => {
    if (url.startsWith('/practice/recommendation')) return Promise.resolve(response({ recommendation: emptyPracticeItem }));
    return Promise.resolve(response({ items: [emptyPracticeItem], subjects: ['mathematics'], pagination: { page: 1, totalPages: 1, totalItems: 1 } }));
  });
  post.mockResolvedValue(response({
    questionType: 'multiple_choice',
    item: {
      ...emptyPracticeItem,
      variants: [{
        questionType: 'multiple_choice', prompt: 'Chọn đáp án đúng.', hint: 'Đọc kỹ đề.',
        options: [{ id: 'A', text: 'Một' }, { id: 'B', text: 'Hai' }, { id: 'C', text: 'Ba' }, { id: 'D', text: 'Bốn' }],
        turns: [], incorrectAttempts: 0, canShowSolution: false,
      }],
    },
  }));

  render(<MemoryRouter><PracticePage /></MemoryRouter>);

  expect(await screen.findByRole('button', { name: /Trắc nghiệm nhiều lựa chọn/i })).toBeInTheDocument();
  expect(post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Trắc nghiệm nhiều lựa chọn/i }));

  await waitFor(() => expect(post).toHaveBeenCalledWith('/practice/items/item-1/generate', {
    questionType: 'multiple_choice',
    language: 'vi',
  }));
  expect(await screen.findByText('Chọn đáp án đúng.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /A\. Một/i })).toBeInTheDocument();
  expect(screen.queryByText('Chọn dạng bài ôn')).not.toBeInTheDocument();
});

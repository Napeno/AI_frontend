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
  blocker: 'calculation',
  subjectArea: 'mathematics',
  status: 'new',
  reviewCount: 0,
  practice: { prompt: 'Tính một biểu thức mới.', hint: 'Làm từng phép tính.', turns: [], incorrectAttempts: 0 },
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

test('paginates saved items and sends an attempt as an interaction', async () => {
  post.mockResolvedValue(response({
    action: 'attempt',
    item: {
      ...item,
      practice: {
        ...item.practice,
        turns: [{ role: 'student', action: 'attempt', content: 'Em tính 3 + 4', createdAt: '2026-07-20T00:00:00.000Z' }],
      },
    },
  }));

  render(<MemoryRouter><PracticePage /></MemoryRouter>);

  await screen.findByText('Tính một biểu thức mới.');
  fireEvent.change(screen.getByPlaceholderText('Viết bước em muốn thử...'), { target: { value: 'Em tính 3 + 4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));

  await waitFor(() => expect(post).toHaveBeenCalledWith('/practice/items/item-1/attempt', expect.objectContaining({
    action: 'attempt',
    answer: 'Em tính 3 + 4',
    language: 'vi',
  })));

  fireEvent.click(screen.getByRole('button', { name: 'Sau →' }));
  await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining('/practice/items?page=2&limit=6')));
});

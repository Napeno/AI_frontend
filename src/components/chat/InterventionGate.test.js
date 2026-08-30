import { fireEvent, render, screen } from '@testing-library/react';
import InterventionGate from './InterventionGate';

const options = [
  { id: 'understand_question', label: 'Giúp em hiểu đề' },
  { id: 'theory', label: 'Nhắc lại lý thuyết' },
  { id: 'calculation', label: 'Kiểm tra lỗi sai' },
  { id: 'creative', label: 'Tìm cách sáng tạo hơn' },
];

test('opens the compact support menu and submits the selected choice', () => {
  const onSubmit = jest.fn();

  render(<InterventionGate intervention={{ active: false, options }} isLoading={false} onSubmit={onSubmit} />);

  expect(screen.queryByRole('button', { name: 'Giúp em hiểu đề' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Em cần hỗ trợ gì tiếp/i }));
  expect(screen.getAllByRole('button')).toHaveLength(5);

  fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra lỗi sai' }));
  expect(onSubmit).toHaveBeenCalledWith({ type: 'support_choice', value: 'calculation' });
});

test('shows the student question when a blocker gate has a mini quiz', () => {
  const onSubmit = jest.fn();
  const miniQuiz = {
    question: 'Bước nhỏ đầu tiên em nên làm là gì?',
    options: [
      { id: 'A', text: 'Xác định dữ kiện' },
      { id: 'B', text: 'Chép đáp án' },
    ],
  };

  render(<InterventionGate intervention={{ active: true, requiredAction: 'choose_blocker', miniQuiz }} isLoading={false} onSubmit={onSubmit} />);

  expect(screen.getByText(miniQuiz.question)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /A\. Xác định dữ kiện/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Em chưa hiểu đề' })).not.toBeInTheDocument();
});

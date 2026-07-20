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

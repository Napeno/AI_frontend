import { formatAIMessage } from './chatUtils';

test('renders LaTeX text content without showing its command', () => {
  const html = formatAIMessage('\\(2 \\times \\text{số hạng 1}\\)');

  expect(html).toContain('2 × số hạng 1');
  expect(html).not.toContain('text(');
});

import { formatAIMessage } from './chatUtils';

test('renders LaTeX text content without showing its command', () => {
  const html = formatAIMessage('\\(2 \\times \\text{số hạng 1}\\)');

  expect(html).toContain('2 × số hạng 1');
  expect(html).not.toContain('text(');
});

test('renders legacy bare exponents used by saved practice items', () => {
  const html = formatAIMessage('25a^2 + 4b^{2} - 20ab');

  expect(html).toContain('a<sup>2</sup>');
  expect(html).toContain('b<sup>2</sup>');
});

test('renders a bare LaTeX fraction without requiring delimiters', () => {
  const html = formatAIMessage('Kết quả là \\frac{a}{b}.');

  expect(html).toContain('math-fraction');
});

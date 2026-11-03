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

test('normalizes duplicated Gemini math escaping', () => {
  const html = formatAIMessage('Chọn \\\\(x + 1\\\\)^2.');

  expect(html).toContain('math-formula');
  expect(html).not.toContain('\\\\(');
});

test('renders a chemistry equation and a stored broken arrow', () => {
  const html = formatAIMessage('$Al + HCl \\rightarrow AlCl_3 + H_2$');
  const broken = formatAIMessage('$Al + HCl \rightarrow AlCl_3 + H_2$');
  const bare = formatAIMessage('Al + HCl ightarrow AlCl_3');

  expect(html).toContain('→');
  expect(html).toContain('<sub>3</sub>');
  expect(html).toContain('<sub>2</sub>');
  expect(html).not.toContain('ightarrow');
  expect(broken).toContain('→');
  expect(broken).not.toContain('ightarrow');
  expect(bare).toContain('→');
  expect(bare).toContain('<sub>3</sub>');
});

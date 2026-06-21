import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './locales/LanguageContext';

test('renders ThinkBridge home page', () => {
  render(
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );

  expect(screen.getByText(/Trợ lý học tập bằng AI/i)).toBeInTheDocument();
});

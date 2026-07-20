import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './locales/LanguageContext';

const renderApp = () => render(
  <AuthProvider>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </AuthProvider>
);

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test('renders ThinkBridge home page', async () => {
  renderApp();

  expect(await screen.findByText(/Trợ lý học tập bằng AI/i)).toBeInTheDocument();
});

test('refreshes a cached admin session and shows the dashboard on home', async () => {
  localStorage.setItem('auth', JSON.stringify({
    token: 'cached-token',
    user: { username: 'admin' },
  }));
  jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
    if (String(url).includes('/auth/me')) {
      return { ok: true, json: async () => ({ user: { _id: 'admin-id', username: 'admin', name: 'Giáo viên', role: 'admin', coins: 0, points: 0, rank: 'bronze', avatar: 'default' } }) };
    }
    return {
      ok: true,
      json: async () => ({
        summary: { totalStudents: 0, requiresIntervention: 0, watchingStudents: 0, improvedStudents: 0, averageBehavioralRisk: 0, averageQuizScore: null, demoStudents: 0, riskDistribution: { green: 0, yellow: 0, red: 0 } },
        chart: { metric: 'risk', groupBy: 'day', points: [] },
        students: [],
        pagination: { page: 1, totalPages: 1 },
      }),
    };
  });

  renderApp();

  expect(await screen.findByRole('heading', { name: 'Dashboard giáo viên' })).toBeInTheDocument();
  expect(screen.queryByText('Game')).not.toBeInTheDocument();
});

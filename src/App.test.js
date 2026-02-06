import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from './redux/store';
import App from './App';

jest.mock('./api/Employee', () => ({
  ME_API: jest.fn(() => Promise.reject(new Error('Not authenticated'))),
}));

test('renders login route', () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});

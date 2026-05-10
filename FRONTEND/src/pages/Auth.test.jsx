import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

import Auth from './Auth.jsx';

describe('Auth page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
    mockRegister.mockReset();
  });

  test('logs in with email identifier and routes buyer home', async () => {
    mockLogin.mockResolvedValue({ role: 'buyer' });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/you@example.com or/i), 'buyer@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'Demo123!');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'buyer@example.com',
        phone: '',
        password: 'Demo123!',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/buyer', { replace: true });
  });
});

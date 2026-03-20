import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders login form with all fields', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    expect(screen.getByText(/还没有账户？/i)).toBeInTheDocument();
    expect(screen.getByText(/立即注册/i)).toHaveAttribute('href', '/register');
  });

  test('shows validation error for empty username', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    const passwordInput = screen.getByLabelText(/密码/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/用户名不能为空/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows validation error for short username', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });

    const passwordInput = screen.getByLabelText(/密码/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/用户名至少需要 3 个字符/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows validation error for empty password', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/密码不能为空/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows validation error for short password', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const passwordInput = screen.getByLabelText(/密码/i);
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/密码至少需要 6 个字符/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('clears error when user starts typing', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    screen.getByLabelText(/密码/i);

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/用户名不能为空/i)).toBeInTheDocument();

    fireEvent.change(usernameInput, { target: { value: 't' } });

    await waitFor(() => {
      expect(screen.queryByText(/用户名不能为空/i)).not.toBeInTheDocument();
    });
  });

  test('calls login and redirects on successful submission', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent(/登录中\.\.\./i);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error message on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/登录失败，请检查用户名和密码是否正确/i)
      ).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('disables form fields while submitting', async () => {
    const mockLogin = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/用户名/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});

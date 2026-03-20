import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterForm', () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockNavigate.mockClear();
  });

  it('renders registration form', () => {
    renderWithRouter(<RegisterForm />);

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
  });

  it('shows error for empty username', async () => {
    renderWithRouter(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('用户名不能为空')).toBeInTheDocument();
  });

  it('shows error for short username', async () => {
    renderWithRouter(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/用户名/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('用户名至少需要 3 个字符')).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    renderWithRouter(<RegisterForm />);

    const emailInput = screen.getByLabelText(/邮箱/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('请输入有效的邮箱地址')).toBeInTheDocument();
  });

  it('shows error for short password', async () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^密码/i);
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('密码至少需要 6 个字符')).toBeInTheDocument();
  });

  it('shows error for password mismatch', async () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^密码/i);
    const confirmPasswordInput = screen.getByLabelText(/确认密码/i);

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('两次输入的密码不一致')).toBeInTheDocument();
  });

  it('clears field error when user starts typing', async () => {
    renderWithRouter(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/用户名/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('用户名至少需要 3 个字符')).toBeInTheDocument();

    fireEvent.change(usernameInput, { target: { value: 'abc' } });

    expect(screen.queryByText('用户名至少需要 3 个字符')).not.toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    mockRegister.mockResolvedValue(undefined);

    renderWithRouter(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/用户名/i);
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/^密码/i);
    const confirmPasswordInput = screen.getByLabelText(/确认密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows general error on registration failure', async () => {
    mockRegister.mockRejectedValue(new Error('注册失败，用户名已存在'));

    renderWithRouter(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/用户名/i);
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/^密码/i);
    const confirmPasswordInput = screen.getByLabelText(/确认密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('注册失败，用户名已存在')).toBeInTheDocument();
  });

  it('disables inputs during submission', async () => {
    mockRegister.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderWithRouter(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/用户名/i);
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/^密码/i);
    const confirmPasswordInput = screen.getByLabelText(/确认密码/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitButton);

    expect(usernameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('注册中...');
  });

  it('has link to login page', () => {
    renderWithRouter(<RegisterForm />);

    const loginLink = screen.getByRole('link', { name: /立即登录/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

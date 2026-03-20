import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterRequest } from '../../types';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      const registerData: RegisterRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
      };

      await register(registerData);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value?: string) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  });

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <h1 className="login-title">注册账户</h1>
        <p className="login-subtitle">创建您的账户以开始使用无人机航线规划系统</p>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          className="login-form"
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '用户名不能为空' },
              { min: 3, message: '用户名至少需要 3 个字符' },
              { max: 50, message: '用户名不能超过 50 个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '邮箱不能为空' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱地址"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '密码不能为空' },
              { min: 6, message: '密码至少需要 6 个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码（至少 6 位）"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="submit-button"
              block
            >
              {isSubmitting ? '注册中...' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-link">
          <p>
            已有账户？{' '}
            <Link to="/login" className="link">
              立即登录
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

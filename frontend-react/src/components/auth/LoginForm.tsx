import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types';

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginRequest) => {
    setIsSubmitting(true);
    try {
      await login(values);
      message.success('登录成功！');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查用户名和密码是否正确';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">🚁</div>
            <h1 className="app-title">农业无人机导航规划系统</h1>
          </div>
        </div>
        
        <Card className="login-card" bordered={false}>
          <div className="login-card-header">
            <h2 className="login-title">欢迎回来</h2>
            <p className="login-subtitle">请登录您的账户以继续</p>
          </div>
          
          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少需要 3 个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少需要 6 个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码"
                disabled={isSubmitting}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={isSubmitting}
                size="large"
                className="login-button"
              >
                {isSubmitting ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <div className="register-section">
            <span className="register-text">还没有账户？</span>
            <Link to="/register" className="register-link">
              立即注册
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

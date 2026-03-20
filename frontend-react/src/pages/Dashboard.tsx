import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { farmlandAPI } from '../services/api';
import type { Farmland } from '../types';
import { FarmlandCard } from '../components/farmland/FarmlandCard';
import { Row, Col, Card, Statistic, Button, Result, Typography, Spin, Space } from 'antd';
import {
  EnvironmentOutlined,
  PlusOutlined,
  RocketOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmlands = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await farmlandAPI.getAll();
        setFarmlands(response.data);
      } catch (err) {
        console.error('获取农田数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmlands();
  }, []);

  const totalFarmlands = farmlands.length;
  const totalArea = farmlands.reduce((sum, f) => sum + f.area, 0);

  const recentFarmlands = [...farmlands]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const handleFarmlandClick = (_farmland: Farmland) => {
    navigate('/farmlands');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Title level={2} style={{ marginBottom: 8 }}>
          欢迎回来，{user?.username || '用户'}！
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          这是您的农田管理仪表板，查看概览和快速操作
        </Text>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="农田总数"
              value={totalFarmlands}
              prefix={<EnvironmentOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="总面积"
              value={totalArea.toFixed(2)}
              precision={2}
              suffix="亩"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={24} lg={8}>
          <Card
            hoverable
            title="快速操作"
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                size="large"
                onClick={() => navigate('/farmlands')}
              >
                创建新农田
              </Button>
              <Button
                icon={<RocketOutlined />}
                block
                size="large"
                onClick={() => navigate('/path-planning')}
              >
                规划航线
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} style={{ margin: 0 }}>
            <HomeOutlined style={{ marginRight: 8 }} />
            最近农田
          </Title>
          {farmlands.length > 3 && (
            <Button type="link" onClick={() => navigate('/farmlands')}>
              查看全部 →
            </Button>
          )}
        </div>

        {error ? (
          <Result
            status="error"
            title="加载失败"
            subTitle={error}
          />
        ) : recentFarmlands.length === 0 ? (
          <Card>
            <Result
              icon={<EnvironmentOutlined />}
              title="暂无农田数据"
              subTitle="点击下方按钮创建您的第一个农田"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/farmlands')}
                >
                  创建农田
                </Button>
              }
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {recentFarmlands.map((farmland) => (
              <Col key={farmland.id} xs={24} sm={12} lg={8}>
                <FarmlandCard
                  farmland={farmland}
                  onClick={handleFarmlandClick}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

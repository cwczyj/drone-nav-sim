import { Card, Statistic, Row, Col, Empty } from 'antd';
import { FieldTimeOutlined, LineOutlined, AimOutlined, ColumnWidthOutlined } from '@ant-design/icons';

interface PathStats {
  totalDistance: number;
  waypointCount: number;
  estimatedTime: number;
  swathWidth: number;
}

interface PathInfoProps {
  pathStats: PathStats | null;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

export default function PathInfo({ pathStats }: PathInfoProps) {
  if (!pathStats) {
    return (
      <Card title="航线统计" bordered style={{ borderRadius: 12 }}>
        <Empty description="暂无航线数据" style={{ padding: '24px 0' }} />
      </Card>
    );
  }

  return (
    <Card title="航线统计" bordered style={{ borderRadius: 12 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12}>
          <Statistic
            title="总距离"
            value={pathStats.totalDistance}
            precision={1}
            suffix="m"
            prefix={<LineOutlined />}
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Statistic
            title="航点数量"
            value={pathStats.waypointCount}
            suffix="个"
            prefix={<AimOutlined />}
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Statistic
            title="预计飞行时间"
            value={formatTime(pathStats.estimatedTime)}
            prefix={<FieldTimeOutlined />}
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Statistic
            title="行宽"
            value={pathStats.swathWidth}
            precision={1}
            suffix="m"
            prefix={<ColumnWidthOutlined />}
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
      </Row>
    </Card>
  );
}

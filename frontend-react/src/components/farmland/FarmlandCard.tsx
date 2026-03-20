import React from 'react';
import { Card, Tag, Typography, Space, Button, theme } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Farmland } from '../../types';

interface FarmlandCardProps {
  farmland: Farmland;
  onClick: (farmland: Farmland) => void;
  onEdit?: (farmland: Farmland) => void;
  onDelete?: (farmland: Farmland) => void;
}

const { Title, Text } = Typography;

const CROP_COLORS: Record<string, string> = {
  '水稻': '#52c41a',
  '小麦': '#faad14',
  '玉米': '#fa8c16',
  '大豆': '#a0d911',
  '棉花': '#eb2f96',
  '油菜': '#faad14',
  '其他': '#8c8c8c',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const FarmlandCard: React.FC<FarmlandCardProps> = ({ farmland, onClick, onEdit, onDelete }) => {
  const { token } = theme.useToken();
  const cropColor = CROP_COLORS[farmland.crop_type] || CROP_COLORS['其他'];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(farmland);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(farmland);
  };

  return (
    <Card
      hoverable
      onClick={() => onClick(farmland)}
      style={{ cursor: 'pointer', height: '100%' }}
      actions={
        onEdit || onDelete
          ? [
              onEdit && (
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={handleEditClick}
                  style={{ color: token.colorPrimary }}
                >
                  编辑
                </Button>
              ),
              onDelete && (
                <Button
                  key="delete"
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteClick}
                  style={{ color: token.colorError }}
                >
                  删除
                </Button>
              ),
            ].filter(Boolean)
          : undefined
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Title level={5} style={{ margin: 0, flex: 1 }}>
            {farmland.name}
          </Title>
        </div>

        <div>
          <Text type="secondary" style={{ marginRight: 8 }}>作物类型:</Text>
          <Tag color={cropColor} style={{ fontWeight: 500 }}>
            {farmland.crop_type}
          </Tag>
        </div>

        <div>
          <Text type="secondary" style={{ marginRight: 16 }}>面积:</Text>
          <Text strong>{farmland.area.toFixed(2)} 亩</Text>
        </div>

        <div>
          <Text type="secondary" style={{ marginRight: 8 }}>创建日期:</Text>
          <Text>{formatDate(farmland.created_at)}</Text>
        </div>
      </Space>
    </Card>
  );
};
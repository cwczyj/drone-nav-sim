import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Alert, Tabs } from 'antd';
import { EnvironmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import { farmlandAPI } from '../../services/api';
import type { Farmland } from '../../types';
import { FarmlandCard } from './FarmlandCard';
import { FarmlandEdit } from './FarmlandEdit';
import { DeleteConfirm } from './DeleteConfirm';
import MapCanvas, { type PolygonData } from '../map/MapCanvas';

const { Title, Text } = Typography;

interface FarmlandListProps {
  onFarmlandClick?: (farmland: Farmland) => void;
}

export const FarmlandList: React.FC<FarmlandListProps> = ({ onFarmlandClick }) => {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFarmland, setEditingFarmland] = useState<Farmland | null>(null);
  const [deletingFarmland, setDeletingFarmland] = useState<Farmland | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  const fetchFarmlands = async () => {
    try {
      setLoading(true);
      const response = await farmlandAPI.getAll();
      setFarmlands(response.data);
      setError(null);
    } catch (err) {
      setError('获取农田列表失败，请稍后重试');
      console.error('Failed to fetch farmlands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmlands();
  }, []);

  // Convert farmlands to PolygonData for map display (without color to use auto-generated colors)
  // Compute this before any conditional returns to maintain hook order
  const mapPolygons: PolygonData[] = farmlands.map((farmland) => ({
    id: farmland.id,
    coordinates: farmland.boundary_coords as [number, number][],
    // No color specified - will use auto-generated colors based on position
  }));

  const handleEdit = (farmland: Farmland) => {
    setEditingFarmland(farmland);
  };

  const handleDelete = (farmland: Farmland) => {
    setDeletingFarmland(farmland);
  };

  const handleEditSuccess = () => {
    fetchFarmlands();
    setEditingFarmland(null);
  };

  const handleDeleteSuccess = () => {
    fetchFarmlands();
    setDeletingFarmland(null);
    setMapRefreshKey((prev) => prev + 1);
  };

  const handleFarmlandClick = (farmland: Farmland) => {
    if (onFarmlandClick) {
      onFarmlandClick(farmland);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48 }}>
          <Spin size="large" tip="加载农田列表中..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  const tabItems = [
    {
      key: 'list',
      label: (
        <span>
          <AppstoreOutlined />
          列表视图
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {farmlands.map((farmland) => (
            <Col key={farmland.id} xs={24} sm={12} lg={8}>
              <FarmlandCard
                farmland={farmland}
                onClick={handleFarmlandClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'map',
      label: (
        <span>
          <EnvironmentOutlined />
          地图总览
        </span>
      ),
      children: (
        <Card bordered bodyStyle={{ padding: 0, height: 500 }}>
          <MapCanvas
            key={`map-${mapRefreshKey}`}
            polygons={mapPolygons}
            editable={false}
          />
        </Card>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            农田管理
          </Title>
          <Text type="secondary">共 {farmlands.length} 个农田</Text>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="middle"
      />

      <FarmlandEdit
        farmland={editingFarmland}
        isOpen={editingFarmland !== null}
        onClose={() => setEditingFarmland(null)}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirm
        farmland={deletingFarmland}
        isOpen={deletingFarmland !== null}
        onClose={() => setDeletingFarmland(null)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};

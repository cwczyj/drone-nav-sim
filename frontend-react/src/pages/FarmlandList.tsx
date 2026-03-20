import { useState, useCallback, useEffect } from 'react';
import { Card, Button, Alert, Row, Col, Typography, Grid, Space, message } from 'antd';
import { PlusOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { Farmland, FarmlandCreate } from '../types';
import { farmlandAPI } from '../services/api';
import MapCanvas, { type PolygonData } from '../components/map/MapCanvas';
import { FarmlandForm } from '../components/farmland/FarmlandForm';
import { FarmlandList as FarmlandListComponent } from '../components/farmland/FarmlandList';

const { Title } = Typography;
const { useBreakpoint } = Grid;

type ViewMode = 'list' | 'create' | 'form';

export default function FarmlandList() {
  const screens = useBreakpoint();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [drawnPolygon, setDrawnPolygon] = useState<PolygonData | null>(null);
  const [existingFarmlands, setExistingFarmlands] = useState<Farmland[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createModeKey, setCreateModeKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing farmlands to display when creating new ones
  useEffect(() => {
    const fetchExistingFarmlands = async () => {
      try {
        const response = await farmlandAPI.getAll();
        setExistingFarmlands(response.data);
      } catch (err) {
        console.error('Failed to fetch existing farmlands:', err);
      }
    };
    fetchExistingFarmlands();
  }, [refreshKey]);

  const handleCreateClick = () => {
    setViewMode('create');
    setDrawnPolygon(null);
    setError(null);
    setCreateModeKey((prev) => prev + 1); // Force remount of MapCanvas to clear drawing layers
  };

  const handleCancelCreate = () => {
    setViewMode('list');
    setDrawnPolygon(null);
    setError(null);
  };

  const handlePolygonCreate = useCallback((polygon: PolygonData) => {
    setDrawnPolygon(polygon);
    setViewMode('form');
  }, []);

  const handleFormSubmit = async (data: FarmlandCreate) => {
    try {
      setSubmitting(true);
      setError(null);

      const submitData: FarmlandCreate = {
        name: data.name,
        area: data.area,
        crop_type: data.crop_type,
        boundary_coords: data.boundary_coords as number[][],
      };

      await farmlandAPI.create(submitData);

      message.success('农田创建成功');
      setRefreshKey((prev) => prev + 1);
      setViewMode('list');
      setDrawnPolygon(null);
    } catch (err) {
      setError('创建农田失败，请稍后重试');
      console.error('Failed to create farmland:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setViewMode('create');
    setDrawnPolygon(null);
    setError(null);
  };

  // Convert existing farmlands to PolygonData for display
  const existingPolygons: PolygonData[] = existingFarmlands.map((farmland) => ({
    id: farmland.id,
    coordinates: farmland.boundary_coords as [number, number][],
    color: '#aa3bff',
    fillColor: '#aa3bff',
    fillOpacity: 0.2,
  }));

  const renderCreateView = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>创建新农田</Title>
        <Button onClick={handleCancelCreate} icon={<CloseOutlined />}>
          取消
        </Button>
      </div>

      <Alert
        message="在地图上绘制农田边界"
        description="使用绘图工具在地图上绘制农田的多边形边界，绘制完成后将自动进入信息填写页面。紫色区域为已存在的农田。"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: 8 }}
      />

      <Card
        bordered
        bodyStyle={{ padding: 0, height: 500 }}
      >
        <MapCanvas
          key={`create-${createModeKey}`}
          polygons={existingPolygons}
          editable={true}
          onPolygonCreate={handlePolygonCreate}
        />
      </Card>
    </Space>
  );

  const renderFormView = () => {
    if (!drawnPolygon) return null;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>填写农田信息</Title>
          <Button
            onClick={handleFormCancel}
            disabled={submitting}
            icon={<CloseOutlined />}
          >
            取消
          </Button>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              bordered
              bodyStyle={{ padding: 0, height: 400 }}
            >
              <MapCanvas
                polygons={[drawnPolygon]}
                editable={false}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <FarmlandForm
              polygonCoords={drawnPolygon.coordinates}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </Col>
        </Row>
      </Space>
    );
  };

  const renderListView = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>农田管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateClick}
          size="large"
        >
          创建新农田
        </Button>
      </div>

      <FarmlandListComponent key={refreshKey} />
    </Space>
  );

  return (
    <div style={{ padding: screens.md ? 24 : 16 }}>
      {viewMode === 'list' && renderListView()}
      {viewMode === 'create' && renderCreateView()}
      {viewMode === 'form' && renderFormView()}
    </div>
  );
}
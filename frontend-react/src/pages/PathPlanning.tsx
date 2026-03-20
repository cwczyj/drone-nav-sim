import { useState, useEffect, useCallback } from 'react';
import { Card, Form, Select, InputNumber, Switch, Button, Alert, Empty, Spin, Row, Col, Typography, Radio, Space } from 'antd';
import { RocketOutlined, DownloadOutlined, SettingOutlined, EnvironmentOutlined, HomeOutlined, ClusterOutlined } from '@ant-design/icons';
import type { Farmland, PathPlanningResponse, AllFarmlandsPathResponse, SingleFarmlandPath } from '../types';
import { farmlandAPI, pathPlanningAPI } from '../services/api';
import PathVisualization from '../components/path/PathVisualization';
import PathInfo from '../components/path/PathInfo';

const { Title } = Typography;

export default function PathPlanning() {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pathMode, setPathMode] = useState<'single' | 'all'>('single');
  const [mergeFarmlands, setMergeFarmlands] = useState<boolean>(false);
  const [selectedFarmlandId, setSelectedFarmlandId] = useState<string>('');
  const [swathWidth, setSwathWidth] = useState<number>(10);
  const [useDl, setUseDl] = useState<boolean>(false);

  const [pathData, setPathData] = useState<PathPlanningResponse | null>(null);
  const [allPathsData, setAllPathsData] = useState<AllFarmlandsPathResponse | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    const fetchFarmlands = async () => {
      try {
        setLoading(true);
        const response = await farmlandAPI.getAll();
        setFarmlands(response.data);
      } catch (err) {
        setError('加载农田列表失败');
        console.error('Failed to fetch farmlands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmlands();
  }, []);

  const handleGenerateAllPaths = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await pathPlanningAPI.generateAll({
        swath_width: swathWidth,
        use_dl: useDl,
        merge_farmlands: mergeFarmlands,
      });
      setAllPathsData(response.data);
      setPathData(null);
      setShowVisualization(true);
    } catch (err) {
      setError('生成所有农田航线失败');
      console.error('Failed to generate paths for all farmlands:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedFarmland = farmlands.find((f) => f.id === selectedFarmlandId);

  const handleGeneratePath = () => {
    if (pathMode === 'all') {
      handleGenerateAllPaths();
      return;
    }
    if (!selectedFarmlandId) {
      setError('请先选择农田');
      return;
    }
    setError(null);
    setShowVisualization(true);
    setPathData(null);
    setAllPathsData(null);
  };

  const handlePathGenerated = useCallback((data: PathPlanningResponse) => {
    setPathData(data);
  }, []);

  const handleExportJson = () => {
    if (allPathsData) {
      // 导出所有农田的航线
      const json = JSON.stringify(allPathsData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flight-paths-all-farmlands.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (pathData?.waypoints) {
      const json = JSON.stringify(pathData.waypoints, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flight-path-${selectedFarmlandId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EnvironmentOutlined />
          航线规划
        </Title>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ borderRadius: 8 }}
        />
      )}

      <Card
        title="规划配置"
        extra={<SettingOutlined />}
        bordered
        style={{ borderRadius: 12 }}
      >
        <Form layout="inline" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <Form.Item label="规划模式" style={{ flex: '1 1 200px' }}>
            <Radio.Group
              value={pathMode}
              onChange={(e) => {
                setPathMode(e.target.value);
                setShowVisualization(false);
                setPathData(null);
                setAllPathsData(null);
              }}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="single">
                <EnvironmentOutlined /> 单块农田
              </Radio.Button>
              <Radio.Button value="all">
                <ClusterOutlined /> 所有农田
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {pathMode === 'all' && (
            <Form.Item label="合并模式" style={{ flex: '1 1 200px' }}>
              <Switch
                checked={mergeFarmlands}
                onChange={(checked) => {
                  setMergeFarmlands(checked);
                  setShowVisualization(false);
                  setAllPathsData(null);
                }}
                checkedChildren="合并"
                unCheckedChildren="分开"
                title="合并模式：将所有农田作为一个整体区域生成航线，包含农田之间的飞行路径"
              />
            </Form.Item>
          )}

          {pathMode === 'single' && (
            <Form.Item label="选择农田" style={{ flex: '1 1 200px' }}>
              <Select
                placeholder="请选择农田"
                options={farmlands.map((f) => ({
                  value: f.id,
                  label: `${f.name} (${f.area.toFixed(1)} 亩)`,
                }))}
                value={selectedFarmlandId}
                onChange={(value) => {
                  setSelectedFarmlandId(value);
                  setShowVisualization(false);
                  setPathData(null);
                }}
                style={{ width: '100%', minWidth: '200px' }}
                allowClear
              />
            </Form.Item>
          )}

          <Form.Item label="行宽 (米)" style={{ flex: '1 1 150px' }}>
            <InputNumber
              min={1}
              max={100}
              value={swathWidth}
              onChange={(value) => setSwathWidth(Number(value))}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="深度学习优化" style={{ flex: '1 1 150px' }}>
            <Switch
              checked={useDl}
              onChange={(checked) => setUseDl(checked)}
              checkedChildren="开"
              unCheckedChildren="关"
            />
          </Form.Item>

          <Form.Item style={{ flex: '1 1 auto' }}>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={handleGeneratePath}
              disabled={pathMode === 'single' && !selectedFarmlandId}
              block
            >
              {pathMode === 'all' 
                ? (mergeFarmlands ? '生成合并航线 (所有农田)' : '生成所有农田航线') 
                : '生成航线'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {pathMode === 'single' && selectedFarmland && showVisualization && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title={`${selectedFarmland.name} - 航线可视化`}
              bordered
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ height: '500px' }}>
                <PathVisualization
                  farmlandId={selectedFarmlandId}
                  boundaryCoords={selectedFarmland.boundary_coords}
                  swathWidth={swathWidth}
                  useDl={useDl}
                  onPathGenerated={handlePathGenerated}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <PathInfo
                pathStats={
                  pathData
                    ? {
                        totalDistance: pathData.total_distance,
                        waypointCount: pathData.waypoints.length,
                        estimatedTime: pathData.estimated_time,
                        swathWidth,
                      }
                    : null
                }
              />

              {pathData && (
                <Card
                  title="导出选项"
                  bordered
                  style={{ borderRadius: 12 }}
                >
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportJson}
                    block
                    size="large"
                  >
                    导出航点 (JSON)
                  </Button>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      )}

      {pathMode === 'all' && showVisualization && allPathsData && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title={`所有农田航线规划 - ${mergeFarmlands ? '合并模式' : '分开模式'}`}
              bordered
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ height: '500px' }}>
                <PathVisualization
                  farmlandId=""
                  boundaryCoords={
                    mergeFarmlands && allPathsData.farmland_boundaries 
                      ? allPathsData.farmland_boundaries.flatMap(b => b.coords)
                      : farmlands.length > 0 ? farmlands[0].boundary_coords : []
                  }
                  swathWidth={swathWidth}
                  useDl={useDl}
                  onPathGenerated={handlePathGenerated}
                  allFarmlandsMode={true}
                  allPathsData={allPathsData}
                  mergeFarmlands={mergeFarmlands}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card
                title="统计信息"
                bordered
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>农田数量:</strong> {allPathsData.farmlands.length} 块
                  </div>
                  <div>
                    <strong>总航程:</strong> {allPathsData.total_distance.toFixed(2)} 米
                  </div>
                  <div>
                    <strong>总预计时间:</strong> {allPathsData.total_estimated_time.toFixed(2)} 分钟
                  </div>
                  <div>
                    <strong>总转弯次数:</strong> {allPathsData.total_turn_count}
                  </div>
                  {mergeFarmlands && (
                    <Alert
                      message="合并模式"
                      description="已将多个农田合并为一个整体区域生成航线，包含农田之间的飞行连接路径"
                      type="info"
                      showIcon
                    />
                  )}
                </Space>
              </Card>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #d9d9d9' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>农田</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>距离 (米)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>时间 (分)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPathsData.farmlands.map((fp: SingleFarmlandPath) => (
                      <tr key={fp.farmland_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px' }}>{fp.farmland_name}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{fp.total_distance.toFixed(1)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{fp.estimated_time.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card
                title="导出选项"
                bordered
                style={{ borderRadius: 12 }}
              >
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportJson}
                  block
                  size="large"
                >
                  导出所有航点 (JSON)
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      )}

      {pathMode === 'single' && !selectedFarmlandId && farmlands.length > 0 && (
        <Empty
          description="请选择一个农田开始规划航线"
          image={<HomeOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
          style={{ padding: '48px 24px' }}
        />
      )}

      {farmlands.length === 0 && !loading && (
        <Empty
          description="暂无农田数据"
          image={<HomeOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
          style={{ padding: '48px 24px' }}
        >
          <Button type="primary" href="/farmlands">
            创建农田
          </Button>
        </Empty>
      )}
    </div>
  );
}
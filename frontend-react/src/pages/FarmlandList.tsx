import { useState, useCallback } from 'react';
import type { FarmlandCreate } from '../types';
import { farmlandAPI } from '../services/api';
import MapCanvas, { type PolygonData } from '../components/map/MapCanvas';
import { FarmlandForm } from '../components/farmland/FarmlandForm';
import { FarmlandList as FarmlandListComponent } from '../components/farmland/FarmlandList';

type ViewMode = 'list' | 'create' | 'form';

export default function FarmlandList() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [drawnPolygon, setDrawnPolygon] = useState<PolygonData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClick = () => {
    setViewMode('create');
    setDrawnPolygon(null);
    setError(null);
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

      alert('农田创建成功');
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

  const renderCreateView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">创建新农田</h2>
        <button
          onClick={handleCancelCreate}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">在地图上绘制农田边界</p>
            <p>使用绘图工具在地图上绘制农田的多边形边界，绘制完成后将自动进入信息填写页面。</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '500px' }}>
        <MapCanvas
          editable={true}
          onPolygonCreate={handlePolygonCreate}
        />
      </div>
    </div>
  );

  const renderFormView = () => {
    if (!drawnPolygon) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">填写农田信息</h2>
          <button
            onClick={handleFormCancel}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '400px' }}>
            <MapCanvas
              polygons={[drawnPolygon]}
              editable={false}
            />
          </div>

          <FarmlandForm
            polygonCoords={drawnPolygon.coordinates}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">农田管理</h2>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          创建新农田
        </button>
      </div>

      <FarmlandListComponent key={refreshKey} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {viewMode === 'list' && renderListView()}
      {viewMode === 'create' && renderCreateView()}
      {viewMode === 'form' && renderFormView()}
    </div>
  );
}
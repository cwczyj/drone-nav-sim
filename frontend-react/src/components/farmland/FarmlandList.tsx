import React, { useEffect, useState } from 'react';
import { farmlandAPI } from '../../services/api';
import type { Farmland } from '../../types';
import { FarmlandCard } from './FarmlandCard';
import { FarmlandEdit } from './FarmlandEdit';
import { DeleteConfirm } from './DeleteConfirm';

interface FarmlandListProps {
  onFarmlandClick?: (farmland: Farmland) => void;
}

export const FarmlandList: React.FC<FarmlandListProps> = ({ onFarmlandClick }) => {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFarmland, setEditingFarmland] = useState<Farmland | null>(null);
  const [deletingFarmland, setDeletingFarmland] = useState<Farmland | null>(null);

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
  };

  const handleFarmlandClick = (farmland: Farmland) => {
    if (onFarmlandClick) {
      onFarmlandClick(farmland);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载农田列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (farmlands.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无农田</h3>
        <p className="text-gray-500">还没有创建任何农田，快去创建第一个农田吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">农田列表</h2>
        <span className="text-sm text-gray-600">共 {farmlands.length} 个农田</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmlands.map((farmland) => (
          <FarmlandCard
            key={farmland.id}
            farmland={farmland}
            onClick={handleFarmlandClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

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
    </div>
  );
};
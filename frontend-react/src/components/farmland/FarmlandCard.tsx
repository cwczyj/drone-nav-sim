import React from 'react';
import type { Farmland } from '../../types';

interface FarmlandCardProps {
  farmland: Farmland;
  onClick: (farmland: Farmland) => void;
  onEdit?: (farmland: Farmland) => void;
  onDelete?: (farmland: Farmland) => void;
}

const CROP_COLORS: Record<string, { bg: string; border: string }> = {
  '水稻': { bg: 'bg-green-100', border: 'border-green-500' },
  '小麦': { bg: 'bg-yellow-100', border: 'border-yellow-500' },
  '玉米': { bg: 'bg-orange-100', border: 'border-orange-500' },
  '大豆': { bg: 'bg-lime-100', border: 'border-lime-500' },
  '棉花': { bg: 'bg-pink-100', border: 'border-pink-500' },
  '油菜': { bg: 'bg-amber-100', border: 'border-amber-500' },
  '其他': { bg: 'bg-gray-100', border: 'border-gray-500' },
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
  const colors = CROP_COLORS[farmland.crop_type] || CROP_COLORS['其他'];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(farmland);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(farmland);
  };

  return (
    <div
      onClick={() => onClick(farmland)}
      className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(farmland);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">{farmland.name}</h3>
        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center">
          <span className="font-medium w-24">作物类型:</span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white shadow-sm">
            {farmland.crop_type}
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-medium w-24">面积:</span>
          <span>{farmland.area.toFixed(2)} 亩</span>
        </div>

        <div className="flex items-center">
          <span className="font-medium w-24">创建日期:</span>
          <span>{formatDate(farmland.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import type { FarmlandCreate } from '../../types';
import { calculatePolygonArea, formatArea } from '../../utils/geometry';

interface FarmlandFormProps {
  polygonCoords: [number, number][];
  onSubmit: (data: FarmlandCreate) => void;
  onCancel: () => void;
  initialData?: Partial<FarmlandCreate>;
}

const CROP_TYPES = ['水稻', '小麦', '玉米', '大豆', '棉花', '油菜', '其他'];

export const FarmlandForm: React.FC<FarmlandFormProps> = ({
  polygonCoords,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, cropType: false });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCropType(initialData.crop_type || '');
    }
  }, [initialData]);

  const area = calculatePolygonArea(polygonCoords);

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return '农田名称不能为空';
    }
    if (value.length > 100) {
      return '农田名称不能超过100个字符';
    }
    return null;
  };

  const validateCropType = (value: string): string | null => {
    if (!value) {
      return '请选择作物类型';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const cropTypeError = validateCropType(cropType);

    if (nameError || cropTypeError) {
      setError(nameError || cropTypeError || null);
      setTouched({ name: true, cropType: true });
      return;
    }

    const formData: FarmlandCreate = {
      name: name.trim(),
      crop_type: cropType,
      area: area,
      boundary_coords: polygonCoords,
    };

    onSubmit(formData);
  };

  const handleBlur = (field: 'name' | 'cropType') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') {
      setError(validateName(name));
    } else {
      setError(validateCropType(cropType));
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">农田信息</h2>

      {error && (touched.name || touched.cropType) && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
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
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            农田名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched.name) {
                setError(validateName(e.target.value));
              }
            }}
            onBlur={() => handleBlur('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入农田名称（1-100字符）"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            {name.length}/100 字符
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
            作物类型 <span className="text-red-500">*</span>
          </label>
          <select
            id="cropType"
            value={cropType}
            onChange={(e) => {
              setCropType(e.target.value);
              if (touched.cropType) {
                setError(validateCropType(e.target.value));
              }
            }}
            onBlur={() => handleBlur('cropType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择作物类型</option>
            {CROP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            面积（自动计算）
          </label>
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
            {formatArea(area)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            根据绘制的多边形自动计算面积
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            提交
          </button>
        </div>
      </form>
    </div>
  );
};
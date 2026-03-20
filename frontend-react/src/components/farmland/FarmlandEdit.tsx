import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import type { Farmland, FarmlandUpdate } from '../../types';
import { farmlandAPI } from '../../services/api';

interface FarmlandEditProps {
  farmland: Farmland | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CROP_TYPES = [
  { value: '水稻', label: '水稻' },
  { value: '小麦', label: '小麦' },
  { value: '玉米', label: '玉米' },
  { value: '大豆', label: '大豆' },
  { value: '棉花', label: '棉花' },
  { value: '油菜', label: '油菜' },
  { value: '其他', label: '其他' },
];

export const FarmlandEdit: React.FC<FarmlandEditProps> = ({
  farmland,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmland) {
      form.setFieldsValue({
        name: farmland.name,
        crop_type: farmland.crop_type,
      });
    } else {
      form.resetFields();
    }
  }, [farmland, form]);

  const handleSubmit = async (values: any) => {
    if (!farmland) return;

    try {
      setLoading(true);
      const updateData: FarmlandUpdate = {
        name: values.name.trim(),
        crop_type: values.crop_type,
      };

      await farmlandAPI.update(farmland.id, updateData);

      message.success('农田更新成功');
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('更新农田失败，请稍后重试');
      console.error('Failed to update farmland:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      title="编辑农田"
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="农田名称"
          rules={[
            { required: true, message: '请输入农田名称' },
            { min: 1, max: 100, message: '农田名称长度必须在 1-100 个字符之间' },
          ]}
        >
          <Input placeholder="请输入农田名称" disabled={loading} />
        </Form.Item>

        <Form.Item
          name="crop_type"
          label="作物类型"
          rules={[{ required: true, message: '请选择作物类型' }]}
        >
          <Select
            options={CROP_TYPES}
            placeholder="请选择作物类型"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

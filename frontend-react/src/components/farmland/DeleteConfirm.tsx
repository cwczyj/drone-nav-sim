import React, { useState } from 'react';
import { Modal, Button, Typography, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { Farmland } from '../../types';
import { farmlandAPI } from '../../services/api';

interface DeleteConfirmProps {
  farmland: Farmland | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Title, Text } = Typography;

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  farmland,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!farmland) return;

    try {
      setLoading(true);
      await farmlandAPI.delete(farmland.id);

      message.success('农田删除成功');
      onSuccess();
    } catch (error) {
      message.error('删除农田失败，请稍后重试');
      console.error('Failed to delete farmland:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
          确认删除
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={
        <>
          <Button onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleDelete}
            loading={loading}
          >
            删除
          </Button>
        </>
      }
      width={480}
    >
      <div style={{ padding: '16px 0' }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          确定要删除这个农田吗？
        </Title>
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary">农田名称：</Text>
          <Text strong>{farmland?.name}</Text>
        </div>
        <Text type="warning">此操作无法撤销，删除后农田信息将永久丢失。</Text>
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Space, Typography, message } from 'antd';
import type { FarmlandCreate } from '../../types';
import { calculatePolygonArea, formatArea } from '../../utils/geometry';

interface FarmlandFormProps {
  polygonCoords: [number, number][];
  onSubmit: (data: FarmlandCreate) => void;
  onCancel: () => void;
  initialData?: Partial<FarmlandCreate>;
}

const { Title } = Typography;

const CROP_TYPES = [
  { value: '水稻', label: '水稻' },
  { value: '小麦', label: '小麦' },
  { value: '玉米', label: '玉米' },
  { value: '大豆', label: '大豆' },
  { value: '棉花', label: '棉花' },
  { value: '油菜', label: '油菜' },
  { value: '其他', label: '其他' },
];

export const FarmlandForm: React.FC<FarmlandFormProps> = ({
  polygonCoords,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const area = calculatePolygonArea(polygonCoords);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name || '',
        crop_type: initialData.crop_type || '',
      });
    }
  }, [initialData, form]);

  const handleFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const formData: FarmlandCreate = {
        name: values.name.trim(),
        crop_type: values.crop_type,
        area: area,
        boundary_coords: polygonCoords,
      };
      await onSubmit(formData);
      form.resetFields();
    } catch (error) {
      message.error('提交失败，请稍后重试');
      console.error('Failed to submit form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>农田信息</Title>}
      bordered
      hoverable
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="name"
          label="农田名称"
          rules={[
            { required: true, message: '请输入农田名称' },
            { min: 1, max: 100, message: '农田名称长度必须在 1-100 个字符之间' },
          ]}
        >
          <Input
            placeholder="请输入农田名称（1-100 字符）"
            maxLength={100}
            showCount
            disabled={submitting}
          />
        </Form.Item>

        <Form.Item
          name="crop_type"
          label="作物类型"
          rules={[{ required: true, message: '请选择作物类型' }]}
        >
          <Select
            options={CROP_TYPES}
            placeholder="请选择作物类型"
            disabled={submitting}
          />
        </Form.Item>

        <Form.Item label="面积（自动计算）">
          <Input
            value={formatArea(area)}
            disabled
            readOnly
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            根据绘制的多边形自动计算面积
          </Typography.Text>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              onClick={onCancel}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

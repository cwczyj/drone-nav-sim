import React from 'react';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider locale={zhCN}>
      {children}
    </ConfigProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
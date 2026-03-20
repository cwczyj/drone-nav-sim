import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

// Configure dayjs for Chinese locale
dayjs.locale('zh-cn')

// Ant Design theme configuration - Agricultural green theme
const themeConfig = {
  token: {
    colorPrimary: '#52c41a', // Agricultural green
    colorSuccess: '#52c41a',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 12,
    },
    Menu: {
      itemBorderRadius: 8,
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <AntApp>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)

import { App as AntdApp, ConfigProvider } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './router'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563ff',
          colorBgBase: '#f5f8ff',
          colorText: '#17305f',
          colorTextSecondary: '#66789f',
          colorBorderSecondary: '#e6eefc',
          borderRadius: 16,
          fontFamily:
            '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App

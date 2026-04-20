import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import router from './routes';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563EB',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorTextBase: '#475569', // Slate-600
          colorTextHeading: '#0F172A', // Slate-900
          colorBgBase: '#FFFFFF',
          colorBgLayout: '#F8FAFC', // Slate-50
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
        },
        components: {
          Layout: {
            headerBg: '#FFFFFF',
            headerHeight: 64,
            siderBg: '#FFFFFF',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#EFF6FF', // Primary-50
            itemSelectedColor: '#2563EB', // Primary-600
            itemColor: '#475569', // Slate-600
            itemHoverColor: '#2563EB',
            itemHoverBg: '#F1F5F9', // Slate-100
            activeBarBorderWidth: 0,
          },
          Table: {
            headerBg: '#F8FAFC', // Slate-50
            headerColor: '#64748B', // Slate-500
            headerSplitColor: 'transparent',
            headerBorderRadius: 0,
            rowHoverBg: '#F1F5F9', // Slate-100
          },
          Button: {
            controlHeight: 40,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 40,
            activeBorderColor: '#2563EB',
            hoverBorderColor: '#2563EB',
          },
          Card: {
            boxShadowTertiary: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          }
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;

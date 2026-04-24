import { useState, useEffect, useCallback, useMemo, memo, type FC } from 'react';
import Layout from 'antd/es/layout';
import theme from 'antd/es/theme';
import Drawer from 'antd/es/drawer';
import type { MenuProps } from 'antd/es/menu';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { getAdminMenuItems, getUserMenuItems } from '../../config/navigation';

const { Content, Sider } = Layout;

const AdminLayout: FC = memo(() => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => {
      nprogress.done();
    }, 200);
    
    if (openDrawer) {
      setOpenDrawer(false);
    }

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = useCallback(({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('access_token');
      navigate('/login');
    } else {
      navigate(key);
    }
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenDrawer(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const adminMenuItems = useMemo(() => getAdminMenuItems(), []);
  const userMenuItems = useMemo(() => getUserMenuItems(), []);

  const handleCloseDrawer = useCallback(() => setOpenDrawer(false), []);

  return (
    <Layout className="h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="shadow-sm border-r border-slate-200 h-screen sticky left-0 top-0 z-30"
          width={260}
        >
          <Sidebar 
            collapsed={collapsed} 
            isMobile={false} 
            items={adminMenuItems} 
            onMenuClick={handleMenuClick} 
          />
        </Sider>
      )}

      {/* Drawer Mobile */}
      <Drawer
        placement="left"
        onClose={handleCloseDrawer}
        open={openDrawer}
        closable={false}
        styles={{ 
          body: { padding: 0 },
          wrapper: { width: 260 }
        }}
      >
        <Sidebar 
          collapsed={false} 
          isMobile={true} 
          items={adminMenuItems} 
          onMenuClick={handleMenuClick} 
        />
      </Drawer>

      <Layout className="h-screen flex flex-col overflow-hidden relative">
        <AdminHeader 
          collapsed={collapsed}
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
          userMenuItems={userMenuItems}
          onUserMenuClick={handleMenuClick}
        />
        
        <Content
          className="overflow-y-auto bg-slate-50 p-4 sm:p-6"
        >
          <div 
            style={{
              padding: isMobile ? 16 : 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;

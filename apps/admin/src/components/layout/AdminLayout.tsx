import React, { useState, useEffect } from 'react';
import { Layout, theme, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { getAdminMenuItems, getUserMenuItems } from '../../config/navigation';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
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

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('access_token');
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenDrawer(!openDrawer);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const adminMenuItems = getAdminMenuItems();
  const userMenuItems = getUserMenuItems();

  return (
    <Layout className="h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Sidebar 
          collapsed={collapsed} 
          isMobile={false} 
          items={adminMenuItems} 
          onMenuClick={handleMenuClick} 
        />
      )}

      {/* Drawer Mobile */}
      <Drawer
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        closable={false}
        width={240}
        styles={{ body: { padding: 0 } }}
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
          className="overflow-y-auto bg-gray-50/50 p-4 sm:p-6"
        >
          <div 
            style={{
              padding: isMobile ? 16 : 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="shadow-sm border border-gray-100"
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

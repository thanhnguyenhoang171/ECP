import React from 'react';
import { Menu, Layout } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation } from 'react-router-dom';
import type { MenuItem } from '../../config/navigation';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  items: MenuItem[];
  onMenuClick: MenuProps['onClick'];
  logoText?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  isMobile, 
  items, 
  onMenuClick,
  logoText = 'Admin ECP'
}) => {
  const location = useLocation();

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="h-16 flex items-center justify-center font-bold text-xl text-primary-600 border-b border-slate-200 shrink-0">
        {(collapsed && !isMobile) ? 'ECP' : logoText}
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={onMenuClick}
          items={items}
          className="border-none"
        />
      </div>
    </div>
  );

  if (isMobile) {
    return SidebarContent;
  }

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed} 
      theme="light" 
      className="shadow-sm border-r border-slate-200 h-screen sticky left-0 top-0 z-30"
      width={260}
    >
      {SidebarContent}
    </Sider>
  );
};

export default Sidebar;

import { memo, type FC } from 'react';
import Menu from 'antd/es/menu';
import type { MenuProps } from 'antd/es/menu';
import { useLocation } from 'react-router-dom';
import type { MenuItem } from '../../config/navigation';

interface SidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  items: MenuItem[];
  onMenuClick: MenuProps['onClick'];
  logoText?: string;
}

const Sidebar: FC<SidebarProps> = memo(({ 
  collapsed, 
  isMobile, 
  items, 
  onMenuClick,
  logoText = 'Admin ECP'
}) => {
  const location = useLocation();

  return (
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
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;

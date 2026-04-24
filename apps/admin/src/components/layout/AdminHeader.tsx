import { memo, type FC } from 'react';
import Layout from 'antd/es/layout';
import Dropdown from 'antd/es/dropdown';
import theme from 'antd/es/theme';
import Space from 'antd/es/space';
import MenuFoldOutlined from '@ant-design/icons/es/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/es/icons/MenuUnfoldOutlined';
import MenuOutlined from '@ant-design/icons/es/icons/MenuOutlined';
import SearchOutlined from '@ant-design/icons/es/icons/SearchOutlined';
import BellOutlined from '@ant-design/icons/es/icons/BellOutlined';
import UserOutlined from '@ant-design/icons/es/icons/UserOutlined';
import type { MenuProps } from 'antd/es/menu';
import { useLocation } from 'react-router-dom';
import { getBreadcrumbsByPath } from '../../config/navigation';
import { Avatar, Breadcrumb, Button } from '../common';

const { Header } = Layout;

interface AdminHeaderProps {
  collapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
  userMenuItems: MenuProps['items'];
  onUserMenuClick: MenuProps['onClick'];
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

const AdminHeader: FC<AdminHeaderProps> = memo(({
  collapsed,
  isMobile,
  onToggleSidebar,
  userMenuItems,
  onUserMenuClick,
  userName = 'Admin User',
  userRole = 'Quản trị viên',
  userAvatar,
}) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();

  const breadcrumbData = getBreadcrumbsByPath(location.pathname);
  const breadcrumbItems = breadcrumbData.map((item) => ({
    title: item.title,
    key: item.key,
  }));

  return (
    <Header 
      style={{ 
        paddingLeft: 16, 
        paddingRight: 24, 
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }} 
      className="border-b border-slate-200 h-16 shrink-0 z-20 sticky top-0"
    >
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={onToggleSidebar}
          className="text-lg w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 border-none"
        />
        <div className="hidden md:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Space size={12}>
          <Button type="text" icon={<SearchOutlined />} className="text-slate-500 hover:text-primary-600 flex items-center justify-center border-none" />
          <Button type="text" icon={<BellOutlined />} className="text-slate-500 hover:text-primary-600 flex items-center justify-center border-none" />
        </Space>
        
        <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

        <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} placement="bottomRight" arrow>
          <div className="flex items-center gap-3 cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-all">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-slate-800">{userName}</span>
              <span className="text-[11px] text-primary-600 uppercase tracking-wider font-bold">{userRole}</span>
            </div>
            <Avatar 
              size={40} 
              src={userAvatar} 
              icon={!userAvatar && <UserOutlined />}
              className="bg-primary-600"
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
});

AdminHeader.displayName = 'AdminHeader';

export default AdminHeader;

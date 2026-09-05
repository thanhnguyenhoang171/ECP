import RolesView from '@/features/roles/components/RolesView';

export const metadata = {
  title: 'Quản lý Vai trò & Phân quyền | Cacao Admin',
  description: 'Quản lý danh mục vai trò hệ thống và cấu hình ma trận phân quyền chi tiết.',
};

export default function RolesPage() {
  return <RolesView />;
}

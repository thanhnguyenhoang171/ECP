import SearchOutlined from '@ant-design/icons/es/icons/SearchOutlined';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import Table from './index';
import Card from '../Card';
import Button from '../Button';
import {type ReactNode, useState} from "react";
import AntdInput from "antd/es/input";

interface DataTableProps<T> {
  columns: ColumnsType<T>;
  dataSource?: T[];
  loading?: boolean;
  total?: number;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  extraButtons?: ReactNode;
  rowKey?: string;
  pagination?: TablePaginationConfig;
}

const DataTable = <T extends object>({
  columns,
  dataSource,
  loading,
  total,
  onSearch,
  onRefresh,
  extraButtons,
  rowKey = 'id',
  pagination,
}: DataTableProps<T>) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (value: string) => {
    setSearchText(value);
    onSearch?.(value);
  };

  return (
    <Card noPadding>
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AntdInput
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-xs"
          allowClear
          value={searchText}
          onChange={(e:any) => handleSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {extraButtons}
          {onRefresh && <Button onClick={onRefresh}>Làm mới</Button>}
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (totalCount) => `Tổng cộng ${totalCount} bản ghi`,
          ...pagination,
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default DataTable;

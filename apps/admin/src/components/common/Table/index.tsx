import { Table as AntdTable } from 'antd';
import type { TableProps as AntdTableProps } from 'antd';

const Table = <RecordType extends object = any>(props: AntdTableProps<RecordType>) => {
  return (
    <AntdTable 
      size="middle" 
      {...props} 
      className={`custom-table ${props.className || ''}`}
    />
  );
};

export default Table;

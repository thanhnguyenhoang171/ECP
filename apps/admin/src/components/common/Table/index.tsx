import AntdTable from 'antd/es/table';
import type { TableProps as AntdTableProps } from 'antd/es/table';

const Table = <RecordType extends object = object>(props: AntdTableProps<RecordType>) => {
  return (
    <AntdTable 
      size="middle" 
      {...props} 
      className={`custom-table ${props.className || ''}`}
    />
  );
};

export default Table;

import { type FC } from 'react';
import AntdTag from 'antd/es/tag';
import type { TagProps as AntdTagProps } from 'antd/es/tag';

const Tag: FC<AntdTagProps> = ({ className, ...props }) => {
  return (
    <AntdTag 
      {...props} 
      className={`font-medium px-2 py-0.5 border-none rounded-md ${className || ''}`}
    />
  );
};

export default Tag;

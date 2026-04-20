import React from 'react';
import { Tag as AntdTag } from 'antd';
import type { TagProps as AntdTagProps } from 'antd';

const Tag: React.FC<AntdTagProps> = ({ className, ...props }) => {
  return (
    <AntdTag 
      {...props} 
      className={`font-medium px-2 py-0.5 border-none rounded-md ${className || ''}`}
    />
  );
};

export default Tag;

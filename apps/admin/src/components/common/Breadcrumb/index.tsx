import React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import type { BreadcrumbProps as AntdBreadcrumbProps } from 'antd';

const Breadcrumb: React.FC<AntdBreadcrumbProps> = ({ className, ...props }) => {
  return (
    <AntdBreadcrumb 
      {...props} 
      className={`text-xs text-slate-400 font-medium ${className || ''}`}
    />
  );
};

export default Breadcrumb;

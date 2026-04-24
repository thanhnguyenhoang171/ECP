import { type FC } from 'react';
import AntdBreadcrumb from 'antd/es/breadcrumb';
import type { BreadcrumbProps as AntdBreadcrumbProps } from 'antd/es/breadcrumb';

const Breadcrumb: FC<AntdBreadcrumbProps> = ({ className, ...props }) => {
  return (
    <AntdBreadcrumb 
      {...props} 
      className={`text-xs text-slate-400 font-medium ${className || ''}`}
    />
  );
};

export default Breadcrumb;

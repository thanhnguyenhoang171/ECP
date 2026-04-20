import React from 'react';
import { Card as AntdCard } from 'antd';
import type { CardProps as AntdCardProps } from 'antd';

interface CustomCardProps extends AntdCardProps {
  noPadding?: boolean;
}

const Card: React.FC<CustomCardProps> = ({ 
  children, 
  className, 
  noPadding, 
  styles,
  ...props 
}) => {
  // Ép kiểu qua any để tránh lỗi TypeScript phức tạp với CardStylesType của Antd
  const customStyles: any = styles || {};
  
  const mergedStyles = {
    ...customStyles,
    body: {
      padding: noPadding ? 0 : 24,
      ...(customStyles.body || {}),
    }
  };

  return (
    <AntdCard
      {...props}
      styles={mergedStyles}
      className={`shadow-soft border-slate-100 ${className || ''}`}
    >
      {children}
    </AntdCard>
  );
};

export default Card;

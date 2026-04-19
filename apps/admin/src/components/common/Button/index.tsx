import React from 'react';
import { Button as AntdButton, ButtonProps as AntdButtonProps } from 'antd';

interface CustomButtonProps extends AntdButtonProps {
  // Bạn có thể thêm các thuộc tính custom riêng của dự án tại đây
  fullWidth?: boolean;
}

const Button: React.FC<CustomButtonProps> = ({ 
  children, 
  className, 
  fullWidth, 
  style,
  ...props 
}) => {
  return (
    <AntdButton
      {...props}
      style={{ 
        ...(fullWidth ? { width: '100%' } : {}),
        ...style 
      }}
      className={`${className || ''}`}
    >
      {children}
    </AntdButton>
  );
};

export default Button;

import React from 'react';
import AntdButton from 'antd/es/button';
import type { ButtonProps as AntdButtonProps } from 'antd/es/button';

interface CustomButtonProps extends AntdButtonProps {
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
      className={`inline-flex items-center justify-center gap-2 ${className || ''}`}
    >
      {children}
    </AntdButton>
  );
};

export default Button;

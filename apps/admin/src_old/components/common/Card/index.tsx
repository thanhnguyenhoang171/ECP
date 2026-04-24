import AntdCard from 'antd/es/card';
import type { CardProps as AntdCardProps } from 'antd/es/card';
import type { FC, CSSProperties } from 'react';

interface CustomCardProps extends AntdCardProps {
  noPadding?: boolean;
}

const Card: FC<CustomCardProps> = ({ 
  children, 
  className, 
  noPadding, 
  styles,
  ...props 
}) => {
  // Use Record type instead of any to satisfy ESLint while maintaining flexibility
  const baseStyles = (styles as Record<string, CSSProperties>) || {};
  
  const mergedStyles: AntdCardProps['styles'] = {
    ...styles,
    body: {
      padding: noPadding ? 0 : 24,
      ...baseStyles.body,
    }
  };

  return (
    <AntdCard
      {...props}
      styles={mergedStyles}
      className={className}
    >
      {children}
    </AntdCard>
  );
};

export default Card;

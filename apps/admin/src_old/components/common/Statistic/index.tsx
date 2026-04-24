import AntdStatistic from 'antd/es/statistic';
import type { StatisticProps as AntdStatisticProps } from 'antd/es/statistic';
import type { FC, CSSProperties } from 'react';

interface ExtendedStatisticProps extends AntdStatisticProps {
  styles?: {
    content?: CSSProperties;
    title?: CSSProperties;
    // Add other semantic slots if needed
  };
}

const Statistic: FC<ExtendedStatisticProps> = ({ className, styles, valueStyle, ...props }) => {
  return (
    <AntdStatistic 
      {...props} 
      styles={{
        ...styles,
        content: {
          fontWeight: 700, 
          fontSize: 24, 
          color: '#0F172A', // Slate-900
          ...styles?.content,
          ...valueStyle,
        },
      }}
      className={`${className || ''}`}
    />
  );
};

export default Statistic;

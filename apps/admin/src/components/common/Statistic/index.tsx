import { type FC } from 'react';
import { Statistic as AntdStatistic } from 'antd';
import type { StatisticProps as AntdStatisticProps } from 'antd';

const Statistic: FC<AntdStatisticProps> = ({ className, valueStyle, ...props }) => {
  return (
    <AntdStatistic 
      {...props} 
      valueStyle={{ 
        fontWeight: 700, 
        fontSize: 24, 
        color: '#0F172A', // Slate-900
        ...valueStyle 
      }}
      className={`${className || ''}`}
    />
  );
};

export default Statistic;

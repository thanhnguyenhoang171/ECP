import { Statistic as AntdStatistic } from 'antd';
import type { StatisticProps as AntdStatisticProps } from 'antd';
import type { FC } from 'react';

const Statistic: FC<AntdStatisticProps> = ({ className, styles, valueStyle, ...props }) => {
  return (
    <AntdStatistic 
      {...props} 
      styles={styles}
      valueStyle={{
        fontWeight: 700, 
        fontSize: 24, 
        color: '#0F172A', // Slate-900
        ...valueStyle,
      }}
      className={`${className || ''}`}
    />
  );
};

export default Statistic;

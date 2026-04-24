import { type FC } from 'react';
import AntdBadge from 'antd/es/badge';
import type { BadgeProps as AntdBadgeProps } from 'antd/es/badge';

const Badge: FC<AntdBadgeProps> = (props) => {
  return <AntdBadge {...props} />;
};

export default Badge;

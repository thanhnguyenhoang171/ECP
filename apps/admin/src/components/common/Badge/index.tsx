import React from 'react';
import { Badge as AntdBadge } from 'antd';
import type { BadgeProps as AntdBadgeProps } from 'antd';

const Badge: React.FC<AntdBadgeProps> = (props) => {
  return <AntdBadge {...props} />;
};

export default Badge;

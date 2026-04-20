import { type FC } from 'react';
import { Avatar as AntdAvatar } from 'antd';
import type { AvatarProps as AntdAvatarProps } from 'antd';

const Avatar: FC<AntdAvatarProps> = ({ className, ...props }) => {
  return (
    <AntdAvatar 
      {...props} 
      className={`shadow-soft border-2 border-white ${className || ''}`}
    />
  );
};

export default Avatar;

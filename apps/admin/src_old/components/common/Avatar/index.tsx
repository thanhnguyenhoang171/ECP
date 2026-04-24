import { type FC } from 'react';
import AntdAvatar from 'antd/es/avatar';
import type { AvatarProps as AntdAvatarProps } from 'antd/es/avatar';

const Avatar: FC<AntdAvatarProps> = ({ className, ...props }) => {
  return (
    <AntdAvatar 
      {...props} 
      className={`shadow-soft border-2 border-white ${className || ''}`}
    />
  );
};

export default Avatar;

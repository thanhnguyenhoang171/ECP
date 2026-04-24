// Type declarations cho @ant-design/icons deep imports
// Package @ant-design/icons v6 không export .d.ts cho từng icon riêng lẻ,
// chỉ export types từ barrel entry point.
// File này giúp TypeScript chấp nhận direct path imports mà không báo lỗi.
declare module '@ant-design/icons/es/icons/*' {
  import { FC } from 'react';
  interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
    onClick?: React.MouseEventHandler<HTMLSpanElement>;
  }
  const Icon: FC<IconProps>;
  export default Icon;
}

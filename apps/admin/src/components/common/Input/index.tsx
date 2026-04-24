import { type FC } from 'react';
import AntdInput from 'antd/es/input';
import type { InputProps as AntdInputProps } from 'antd/es/input';
import type { PasswordProps } from 'antd/es/input';

const Input: FC<AntdInputProps> & { Password: FC<PasswordProps> } = (props) => {
  return <AntdInput {...props} />;
};

Input.Password = (props: PasswordProps) => {
  return <AntdInput.Password {...props} />;
};

export default Input;

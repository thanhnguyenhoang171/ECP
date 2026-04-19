import React from 'react';
import { Input as AntdInput } from 'antd';
import type { InputProps as AntdInputProps } from 'antd';
import type { PasswordProps } from 'antd/es/input';

const Input: React.FC<AntdInputProps> & { Password: React.FC<PasswordProps> } = (props) => {
  return <AntdInput {...props} />;
};

Input.Password = (props: PasswordProps) => {
  return <AntdInput.Password {...props} />;
};

export default Input;

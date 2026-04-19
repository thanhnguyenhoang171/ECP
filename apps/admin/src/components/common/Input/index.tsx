import React from 'react';
import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { PasswordProps } from 'antd/es/input';

interface CustomInputProps extends AntdInputProps {}

const Input: React.FC<CustomInputProps> & { Password: React.FC<PasswordProps> } = (props) => {
  return <AntdInput {...props} />;
};

Input.Password = (props: PasswordProps) => {
  return <AntdInput.Password {...props} />;
};

export default Input;

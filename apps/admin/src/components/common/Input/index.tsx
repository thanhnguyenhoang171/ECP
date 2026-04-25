import React from 'react';
import { Input as AntdInput } from 'antd';
import type { InputProps as AntdInputProps } from 'antd';
import type { PasswordProps } from 'antd/es/input';

const InputComponent: React.FC<AntdInputProps> = (props) => {
  return <AntdInput {...props} />;
};

const PasswordComponent: React.FC<PasswordProps> = (props) => {
  return <AntdInput.Password {...props} />;
};

PasswordComponent.displayName = 'Input.Password';

const Input = Object.assign(InputComponent, {
  Password: PasswordComponent,
});

Input.displayName = 'Input';

export default Input;

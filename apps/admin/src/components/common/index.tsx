import React from 'react';
import { Button as AntdButton, Input as AntdInput } from 'antd';

export const Button = (props: any) => <AntdButton {...props} />;
(Button as any).displayName = 'Button';

const InputComponent = (props: any) => <AntdInput {...props} />;
const PasswordComponent = (props: any) => <AntdInput.Password {...props} />;

(PasswordComponent as any).displayName = 'Input.Password';

export const Input = Object.assign(InputComponent, {
  Password: PasswordComponent,
});
(Input as any).displayName = 'Input';

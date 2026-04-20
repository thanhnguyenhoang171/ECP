import React from 'react';
import { Form as AntdForm } from 'antd';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface FormControlProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  help?: string;
}

const FormControl = <T extends FieldValues>({
  name,
  control,
  label,
  error,
  required,
  children,
  help,
}: FormControlProps<T>) => {
  return (
    <AntdForm.Item
      label={label}
      required={required}
      validateStatus={error ? 'error' : ''}
      help={error || help}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => React.cloneElement(children, { ...field })}
      />
    </AntdForm.Item>
  );
};

export default FormControl;

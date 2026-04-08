export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  labelClassName?: string;
  error?: boolean;
  errorText?: string;
  helperText?: React.ReactNode;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  inputSize?: 'sm' | 'md';
  ref?: React.Ref<HTMLInputElement>;
  type?: string;
  layout?: 'vertical' | 'horizontal';
  inputClassName?: string;
  onRightIconClick?: () => void;
  onLeftIconClick?: () => void;
}

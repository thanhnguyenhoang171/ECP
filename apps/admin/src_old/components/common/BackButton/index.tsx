import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftOutlined from '@ant-design/icons/es/icons/ArrowLeftOutlined';
import Button from '../Button';

interface BackButtonProps {
  label?: string;
  className?: string;
  destination?: string;
}

const BackButton: FC<BackButtonProps> = ({ 
  label = 'Quay lại', 
  className,
  destination 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (destination) {
      navigate(destination);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      type="text" 
      onClick={handleBack}
      className={`group flex items-center text-slate-500 hover:text-primary-600 font-medium transition-all p-0 h-auto border-none hover:bg-transparent ${className || ''}`}
    >
      <div className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center mr-2 group-hover:bg-primary-50 transition-all border border-slate-100">
        <ArrowLeftOutlined className="text-xs" />
      </div>
      <span className="text-sm">{label}</span>
    </Button>
  );
};

export default BackButton;

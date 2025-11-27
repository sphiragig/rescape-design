import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'light';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-sm";
  
  const variants = {
    // Rust primary
    primary: "bg-[#8C4A33] text-[#E2D2BC] hover:bg-[#7a402c] hover:text-white border border-transparent shadow-[0_4px_14px_0_rgba(140,74,51,0.39)]",
    // Olive secondary
    secondary: "bg-[#646E57] text-white hover:bg-[#535c48] backdrop-blur-sm border border-[#7a866b]",
    // Cream/Light
    light: "bg-[#E2D2BC] text-[#646E57] hover:bg-[#d4c3ab] font-semibold",
    ghost: "text-[#E2D2BC] hover:text-white hover:bg-white/10",
    outline: "border border-[#A4BAA8]/30 text-[#E2D2BC] hover:border-[#E2D2BC] hover:text-white"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-5 text-sm rounded-xl",
    lg: "h-12 px-8 text-base rounded-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      )}
      {children}
    </button>
  );
};
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'luxury' | 'outline' | 'gold' | 'glass' | 'orange';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  textClassName?: string;
  loading?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  icon, 
  className = '', 
  textClassName = '',
  loading = false,
  ...props 
}) => {
  const baseStyles = 'rounded-[20px] flex-row items-center justify-center active:scale-[0.98] premium-hover';
  
  const sizeStyles = {
    small: 'px-4 py-2.5',
    medium: 'px-6 py-4',
    large: 'px-8 py-5',
  };

  const variantStyles = {
    primary: 'bg-surface border border-card-border',
    secondary: 'bg-primary border border-slate-800',
    accent: 'bg-accent/20 border border-accent/40',
    luxury: 'bg-luxury/20 border border-luxury/40',
    outline: 'bg-transparent border border-slate-700',
    gold: 'bg-gold border border-gold shadow-lg shadow-gold/20',
    glass: 'bg-glass border border-white/10 backdrop-blur-md',
    orange: 'bg-orange/20 border border-orange/40',
  };

  const textBaseStyles = 'font-bold text-center tracking-tight';
  
  const textSizeStyles = {
    small: 'text-xs',
    medium: 'text-base',
    large: 'text-lg',
  };

  const textVariantStyles = {
    primary: 'text-textPrimary',
    secondary: 'text-textSecondary',
    accent: 'text-accent',
    luxury: 'text-luxury',
    outline: 'text-textPrimary',
    gold: 'text-primary',
    glass: 'text-textPrimary',
    orange: 'text-orange',
  };

  const getLoaderColor = () => {
    if (variant === 'gold') return '#0A192F';
    if (variant === 'accent') return '#76b33a';
    if (variant === 'luxury') return '#D4AF37';
    if (variant === 'orange') return '#df7c27';
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${loading ? 'opacity-70' : ''}`} 
      activeOpacity={0.7}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${textBaseStyles} ${textSizeStyles[size]} ${textVariantStyles[variant]} ${textClassName}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

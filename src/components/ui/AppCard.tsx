import React from 'react';
import { View, ViewProps } from 'react-native';

interface AppCardProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'glass' | 'luxury' | 'gradient';
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'rounded-[32px] p-6 border overflow-hidden shadow-2xl';
  const variantStyles = {
    primary: 'bg-surface border-card-border',
    secondary: 'bg-primary border-slate-800',
    glass: 'bg-glass/80 border-slate-700/50 backdrop-blur-xl',
    luxury: 'bg-surface border-gold/30 shadow-gold/5',
    gradient: 'bg-primary border-gold/20',
  };

  return (
    <View 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`} 
      {...props}
    >
      {/* Dynamic Glows for 'Wow' factor */}
      {variant === 'primary' && (
        <View className="absolute -top-20 -right-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl opacity-50" />
      )}
      {variant === 'luxury' && (
        <View className="absolute -top-20 -right-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl opacity-30" />
      )}
      {variant === 'gradient' && (
        <>
          <View className="absolute -top-20 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl " />
          <View className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl " />
        </>
      )}
      {children}
    </View>
  );
};

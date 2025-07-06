import React from 'react';

// Custom Button Component
export const Button = ({ 
  children, 
  variant = 'secondary', 
  size = 'medium',
  icon,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    plain: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Custom Input Component
export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
};

// Custom Card Component
export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

// Custom Dialog Components
export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ asChild, children, onClick }) => {
  if (asChild) {
    return React.cloneElement(children, { onClick });
  }
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

export const DialogContent = ({ children }) => {
  return <>{children}</>;
};

export const DialogHeader = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children }) => {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
};

export const DialogDescription = ({ children }) => {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
};

// Custom Select Component
export const Select = ({ options = [], value, onChange, placeholder = "Select...", className = '' }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Custom Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Custom Progress Bar Component
export const ProgressBar = ({ value, max = 100, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Custom Alert Component
export const Alert = ({ children, variant = 'info', className = '' }) => {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`p-4 rounded-md border ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// SparkApp equivalent
export const SparkApp = ({ children }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

// PageContainer equivalent  
export const PageContainer = ({ children, maxWidth = 'medium' }) => {
  const maxWidthClasses = {
    small: 'max-w-2xl',
    medium: 'max-w-4xl',
    large: 'max-w-6xl'
  };
  
  return (
    <div className={`mx-auto px-4 ${maxWidthClasses[maxWidth]}`}>
      {children}
    </div>
  );
};

// Simple local storage hook to replace useKV
export const useKV = (key, defaultValue) => {
  const [value, setValue] = React.useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  const setStoredValue = React.useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [value, setStoredValue];
};

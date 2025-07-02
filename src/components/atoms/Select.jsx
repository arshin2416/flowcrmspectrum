import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = ({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900
            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon name="ChevronDown" className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
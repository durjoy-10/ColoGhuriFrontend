import React from 'react';

const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    placeholder,
    icon: Icon,
    className = '',
    ...props
}) => {
    const hasError = error && touched;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-800">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Icon className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                )}

                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={`
                        w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none
                        transition-all duration-200 placeholder:text-slate-400
                        focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100
                        disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
                        ${Icon ? 'pl-12' : ''}
                        ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300'}
                        ${className}
                    `}
                    {...props}
                />
            </div>

            {hasError && (
                <p className="mt-2 text-sm font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
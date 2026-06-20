import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    icon: Icon,
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'border border-primary-200 text-primary-700 bg-white hover:bg-primary-50 shadow-soft',
        danger: 'btn-danger',
        success: 'btn-success',
        ghost: 'text-slate-700 hover:bg-slate-100',
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm rounded-xl',
        md: 'px-5 py-3 text-sm rounded-2xl',
        lg: 'px-7 py-4 text-base rounded-2xl',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 font-semibold
                transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-100
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${fullWidth ? 'w-full' : ''}
                ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
                    />
                </svg>
            )}

            {Icon && !loading && <Icon className="h-4 w-4" />}

            <span>{children}</span>
        </button>
    );
};

export default Button;
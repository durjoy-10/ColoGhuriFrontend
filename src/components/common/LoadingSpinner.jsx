import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading your travel experience...' }) => {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-5">
            <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow animate-pulse-soft"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl">
                    ✈️
                </div>
            </div>

            <div className="text-center">
                <p className="font-semibold text-dark-700">
                    {text}
                </p>
                <div className="mt-3 flex justify-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]"></span>
                    <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:300ms]"></span>
                </div>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/85 backdrop-blur-xl">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex min-h-[260px] items-center justify-center py-16">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
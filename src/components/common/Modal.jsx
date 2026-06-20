import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}) => {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-7xl',
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`w-full ${sizes[size] || sizes.md} animate-scale-in overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fill the required information carefully.
                        </p>
                    </div>

                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="max-h-[78vh] overflow-y-auto bg-white p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
import React from 'react';
import { PlusIcon } from 'lucide-react';

const EmptyState = ({
    title,
    description,
    icon: Icon,
    buttonText,
    onButtonClick
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-base-100 rounded-3xl border border-dashed border-base-300">
            {Icon && (
                <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-base-content/40" />
                </div>
            )}
            <h3 className="text-xl font-bold text-base-content">{title}</h3>
            <p className="text-base-content/60 mt-2 max-w-sm mx-auto">
                {description}
            </p>
            {buttonText && onButtonClick && (
                <button
                    onClick={onButtonClick}
                    className="btn btn-primary mt-8 gap-2 shadow-lg shadow-primary/20"
                >
                    {buttonText === "Add Product" && <PlusIcon className="w-5 h-5" />}
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;

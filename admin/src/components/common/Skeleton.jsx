export const Skeleton = ({ className = "", ...props }) => {
    return (
        <div
            className={`animate-pulse bg-base-300 rounded-md ${className}`}
            {...props}
        />
    );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-base-200 animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="flex-1 h-12 bg-base-300 rounded-lg"></div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 animate-pulse">
            <div className="card-body p-4 flex-row items-center gap-6">
                <div className="w-20 h-20 bg-base-300 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-base-300 rounded w-1/3"></div>
                    <div className="h-4 bg-base-300 rounded w-1/4"></div>
                    <div className="flex gap-4">
                        <div className="h-8 bg-base-300 rounded w-16"></div>
                        <div className="h-8 bg-base-300 rounded w-16"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

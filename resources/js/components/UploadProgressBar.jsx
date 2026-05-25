export default function UploadProgressBar({ progress, label = 'Subiendo archivo...' }) {
    if (progress === null || progress === undefined) {
        return null;
    }

    const indeterminate = progress < 0;

    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4" role="status" aria-live="polite">
            <div className="flex justify-between text-sm font-medium text-blue-900 mb-2">
                <span>{label}</span>
                {!indeterminate && <span>{progress}%</span>}
                {indeterminate && <span className="text-blue-700">En curso...</span>}
            </div>
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                {indeterminate ? (
                    <div className="h-full w-full bg-blue-500 rounded-full animate-pulse" />
                ) : (
                    <div
                        className="h-full bg-blue-600 rounded-full transition-[width] duration-200 ease-out"
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                    />
                )}
            </div>
            {progress >= 100 && (
                <p className="text-xs text-blue-800 mt-2">Archivo enviado. Guardando aplicación...</p>
            )}
        </div>
    );
}

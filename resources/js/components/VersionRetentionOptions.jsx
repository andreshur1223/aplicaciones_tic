export default function VersionRetentionOptions({
    keepPrevious,
    onKeepPreviousChange,
    maxVersions,
    onMaxVersionsChange,
    uploadLimits,
    archivedCount = 0,
    disabled = false,
    onViewVersions = null,
    showViewVersions = false,
}) {
    const defaultMax = uploadLimits?.default_max_versions ?? 5;
    const maxLimit = uploadLimits?.max_versions_limit ?? 20;

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={keepPrevious}
                    onChange={(e) => onKeepPreviousChange(e.target.checked)}
                    disabled={disabled}
                    className="mt-1 rounded border-slate-300"
                />
                <span>
                    <span className="block text-sm font-medium text-slate-800">
                        Conservar versiones anteriores
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                        Al subir un nuevo instalador, el archivo actual se archiva en lugar de borrarse.
                    </span>
                </span>
            </label>

            {keepPrevious && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Máximo de versiones a almacenar
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={maxLimit}
                            value={maxVersions}
                            onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (!Number.isNaN(v)) {
                                    onMaxVersionsChange(Math.min(maxLimit, Math.max(1, v)));
                                }
                            }}
                            disabled={disabled}
                            className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Incluye la versión activa (por defecto {defaultMax}, máximo {maxLimit}).
                            {archivedCount > 0 && (
                                <> Hay {archivedCount} versión{archivedCount !== 1 ? 'es' : ''} archivada{archivedCount !== 1 ? 's' : ''}.</>
                            )}
                        </p>
                    </div>

                    {showViewVersions && onViewVersions && (
                        <button
                            type="button"
                            onClick={onViewVersions}
                            disabled={disabled}
                            className="text-sm font-medium text-blue-800 hover:text-blue-900 hover:underline disabled:opacity-50"
                        >
                            Ver versiones anteriores
                            {archivedCount > 0 ? ` (${archivedCount})` : ''}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

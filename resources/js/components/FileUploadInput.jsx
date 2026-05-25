const SCRIPT_EXT = ['bat', 'ps1'];

function formatBytes(bytes) {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
}

export default function FileUploadInput({
    value,
    onChange,
    accept,
    label = 'Archivo instalador',
    maxBytes = null,
    maxHuman = null,
}) {
    const handleChange = (e) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    };

    const ext = value?.name?.split('.').pop()?.toLowerCase();
    const isScript = ext && SCRIPT_EXT.includes(ext);
    const tooLarge = value && maxBytes && value.size > maxBytes;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {maxHuman && (
                <p className="text-xs text-slate-500 mb-2">
                    Tamaño máximo permitido: <strong>{maxHuman}</strong>
                </p>
            )}
            <input
                type="file"
                onChange={handleChange}
                accept={accept}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100"
            />
            {value && (
                <p className={`mt-1 text-xs ${tooLarge ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    Seleccionado: {value.name} ({formatBytes(value.size)})
                    {tooLarge && ` — supera el límite (${maxHuman})`}
                </p>
            )}
            {isScript && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                    <strong>Advertencia de seguridad:</strong> Los archivos .bat y .ps1 son scripts ejecutables.
                    Revíselos cuidadosamente antes de publicarlos en la red interna.
                </div>
            )}
        </div>
    );
}

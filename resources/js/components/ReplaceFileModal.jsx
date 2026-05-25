import { useEffect, useState } from 'react';
import FileUploadInput from './FileUploadInput';
import UploadProgressBar from './UploadProgressBar';

const ACCEPT = '.exe,.msi,.zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.bat,.ps1,.cfg';

export default function ReplaceFileModal({
    open,
    app,
    uploadLimits,
    onClose,
    onSubmit,
}) {
    const [file, setFile] = useState(null);
    const [version, setVersion] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        if (open && app) {
            setVersion(app.version || '');
            setFile(null);
            setError('');
            setProgress(null);
        }
    }, [open, app?.id, app?.version]);

    if (!open || !app) return null;

    const maxBytes = uploadLimits?.effective_max_bytes ?? uploadLimits?.max_bytes ?? null;
    const maxHuman = uploadLimits?.effective_max_human ?? uploadLimits?.max_human ?? null;

    const handleClose = () => {
        if (uploading) return;
        setFile(null);
        setVersion('');
        setError('');
        setProgress(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Seleccione el nuevo archivo instalador.');
            return;
        }
        if (maxBytes && file.size > maxBytes) {
            setError(`El archivo supera el límite permitido (${maxHuman}).`);
            return;
        }
        if (!version.trim()) {
            setError('Indique la versión del nuevo instalador.');
            return;
        }

        setError('');
        setUploading(true);
        setProgress(-1);

        try {
            await onSubmit({
                file,
                version: version.trim(),
                onProgress: (ev) => {
                    if (!ev.total) {
                        setProgress(-1);
                        return;
                    }
                    setProgress(Math.round((ev.loaded * 100) / ev.total));
                },
            });
            setFile(null);
            setVersion('');
            setProgress(null);
            onClose();
        } catch (err) {
            setProgress(null);
            setError(
                err.response?.data?.message
                || Object.values(err.response?.data?.errors || {}).flat().join(' ')
                || 'No se pudo subir el archivo.',
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Reemplazar instalador</h3>
                <p className="text-sm text-slate-600 mb-4">
                    <span className="font-medium text-slate-800">{app.name}</span>
                    {' — '}
                    archivo actual: <span className="font-mono text-xs">{app.file_name}</span>
                    {app.file_size_human && (
                        <span className="text-slate-500"> ({app.file_size_human})</span>
                    )}
                </p>

                {app.keep_version_history && (
                    <p className="text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
                        Esta aplicación conserva versiones anteriores (máx. {app.max_versions_to_keep}).
                        El instalador actual se archivará al subir uno nuevo.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Versión</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="Ej. 2.1.0"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            disabled={uploading}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Actualice la versión si el nuevo instalador corresponde a otra release.
                        </p>
                    </div>

                    <FileUploadInput
                        value={file}
                        onChange={setFile}
                        accept={ACCEPT}
                        label="Nuevo archivo instalador"
                        maxBytes={maxBytes}
                        maxHuman={maxHuman}
                    />

                    <UploadProgressBar progress={uploading ? progress : null} />

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={uploading}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="px-4 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Subiendo...' : 'Subir y reemplazar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

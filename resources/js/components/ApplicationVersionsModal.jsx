import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import ConfirmModal from './ConfirmModal';

export default function ApplicationVersionsModal({ open, app, onClose, onChanged }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadVersions = useCallback(() => {
        if (!app?.id) return Promise.resolve();

        setLoading(true);
        setError('');

        return adminApi.applications.versions(app.id)
            .then((r) => setVersions(r.data.data || r.data || []))
            .catch((err) => {
                setVersions([]);
                setError(
                    err.response?.data?.message || 'No se pudo cargar el historial de versiones.',
                );
            })
            .finally(() => setLoading(false));
    }, [app?.id]);

    useEffect(() => {
        if (open && app?.id) {
            loadVersions();
        }
    }, [open, app?.id, loadVersions]);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await adminApi.applications.removeVersion(app.id, deleteTarget.id);
            setVersions((prev) => prev.filter((v) => v.id !== deleteTarget.id));
            setDeleteTarget(null);
            onChanged?.();
        } catch (err) {
            setError(
                err.response?.data?.message || 'No se pudo eliminar la versión.',
            );
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    if (!open || !app) return null;

    const downloadUrl = (versionId) =>
        adminApi.applications.versionDownloadUrl(app.id, versionId);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Versiones anteriores</h3>
                            <p className="text-sm text-slate-600 mt-0.5">{app.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Versión activa: <strong>{app.version}</strong>
                                {app.file_name && (
                                    <>
                                        {' · '}
                                        {app.file_name}
                                    </>
                                )}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {loading && (
                            <p className="text-sm text-slate-500 py-4">Cargando historial...</p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                        )}
                        {!loading && !error && versions.length === 0 && (
                            <p className="text-sm text-slate-500 py-4">
                                Aún no hay versiones archivadas. Al subir un nuevo instalador con la opción
                                activa, las anteriores aparecerán aquí.
                            </p>
                        )}
                        {!loading && versions.length > 0 && (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Versión</th>
                                        <th className="px-3 py-2 font-medium">Archivo</th>
                                        <th className="px-3 py-2 font-medium">Tamaño</th>
                                        <th className="px-3 py-2 font-medium">Archivada</th>
                                        <th className="px-3 py-2 text-right font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versions.map((v) => (
                                        <tr key={v.id} className="border-t">
                                            <td className="px-3 py-2 font-medium">{v.version}</td>
                                            <td className="px-3 py-2 font-mono text-xs">{v.file_name}</td>
                                            <td className="px-3 py-2 text-slate-600">{v.file_size_human}</td>
                                            <td className="px-3 py-2 text-slate-600">
                                                {v.archived_at
                                                    ? new Date(v.archived_at).toLocaleString('es')
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right whitespace-nowrap space-x-3">
                                                <a
                                                    href={downloadUrl(v.id)}
                                                    className="text-blue-800 hover:underline text-xs font-medium"
                                                >
                                                    Descargar
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(v)}
                                                    disabled={deleting}
                                                    className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 mt-2 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={!!deleteTarget}
                title="Eliminar versión archivada"
                message={
                    deleteTarget
                        ? `Se eliminará la versión ${deleteTarget.version} (${deleteTarget.file_name}) y su archivo del servidor. Esta acción no se puede deshacer.`
                        : ''
                }
                confirmLabel="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => !deleting && setDeleteTarget(null)}
            />
        </>
    );
}

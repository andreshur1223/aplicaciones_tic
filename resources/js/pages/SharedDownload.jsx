import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import CategoryBadge from '../components/CategoryBadge';
import InfoRow from '../components/InfoRow';
import DownloadPasswordPanel from '../components/DownloadPasswordPanel';
import { publicApi, shareDownloadUrl, sharePageUrl } from '../api/client';

function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es');
}

export default function SharedDownload() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        publicApi.share(token)
            .then((res) => setData(res.data.data || res.data))
            .catch(() => setError('Enlace no encontrado o no válido.'));
    }, [token]);

    if (error) {
        return (
            <PublicLayout>
                <div className="max-w-lg mx-auto bg-white rounded-xl border p-8 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/" className="text-blue-800 hover:underline">Ir al inicio</Link>
                </div>
            </PublicLayout>
        );
    }

    if (!data) {
        return (
            <PublicLayout>
                <p className="text-slate-500 text-center">Cargando enlace compartido...</p>
            </PublicLayout>
        );
    }

    const app = data.application?.data || data.application;
    const canDownload = data.can_download;
    const pageUrl = sharePageUrl(token);

    return (
        <PublicLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
                    <p className="font-medium">Enlace compartido — Centro de Aplicaciones TIC</p>
                    <p className="mt-1 text-blue-800 break-all">{pageUrl}</p>
                </div>

                {!canDownload && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {data.unavailable_reason || 'Este enlace no está disponible para descarga.'}
                    </div>
                )}

                {app ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                        <div className="flex flex-wrap justify-between gap-4 mb-6">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                    Aplicación compartida
                                </p>
                                <h1 className="text-3xl font-bold text-slate-900">{app.name}</h1>
                                <p className="text-slate-500 mt-1">Versión {app.version}</p>
                            </div>
                            {canDownload && (
                                app.requires_download_password ? (
                                    <DownloadPasswordPanel
                                        app={app}
                                        fileSizeHuman={app.file_size_human}
                                        shareToken={token}
                                    />
                                ) : (
                                    <a
                                        href={shareDownloadUrl(token)}
                                        className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                                    >
                                        Descargar ({app.file_size_human})
                                    </a>
                                )
                            )}
                        </div>

                        {app.is_script && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
                                <strong>Advertencia:</strong> Este archivo es un script (.bat/.ps1).
                                Verifique su origen antes de ejecutarlo.
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Categoría</h3>
                                    <CategoryBadge category={app.category} className="mt-1" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Descripción</h3>
                                    <p className="mt-1 text-slate-700">{app.description || '—'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">
                                        Instrucciones de instalación
                                    </h3>
                                    <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                                        {app.instructions || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-lg p-5 space-y-3 text-sm">
                                    <InfoRow label="Sistema operativo" value={app.os} />
                                    <InfoRow label="Arquitectura" value={app.architecture} />
                                    <InfoRow
                                        label="Requiere administrador"
                                        value={app.requires_admin ? 'Sí' : 'No'}
                                    />
                                    <InfoRow label="Tamaño del archivo" value={app.file_size_human} />
                                </div>
                                <div className="bg-slate-50 rounded-lg p-5 space-y-3 text-sm">
                                    <h3 className="font-medium text-slate-700">Condiciones del enlace</h3>
                                    <InfoRow label="Expira" value={formatDateTime(data.expires_at)} />
                                    <InfoRow
                                        label="Descargas usadas"
                                        value={
                                            data.max_downloads != null
                                                ? `${data.current_downloads} / ${data.max_downloads}`
                                                : String(data.current_downloads)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-slate-50 rounded-lg p-5">
                            <InfoRow variant="filename" label="Nombre del archivo" value={app.file_name} />
                        </div>

                        {canDownload && (
                            <div className="mt-8 pt-6 border-t text-center">
                                {app.requires_download_password ? (
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm text-slate-600 mb-4">
                                            Debe ingresar la contraseña de la aplicación antes de descargar.
                                        </p>
                                        <DownloadPasswordPanel
                                            app={app}
                                            fileSizeHuman={app.file_size_human}
                                            shareToken={token}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-slate-600 mb-4">
                                            La descarga no comenzará hasta que pulse el botón.
                                        </p>
                                        <a
                                            href={shareDownloadUrl(token)}
                                            className="inline-flex items-center px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Descargar ahora
                                        </a>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-600">No hay información de la aplicación.</p>
                )}

                <p className="text-center mt-6">
                    <Link to="/" className="text-sm text-blue-800 hover:underline">
                        ← Volver al portal de aplicaciones
                    </Link>
                </p>
            </div>
        </PublicLayout>
    );
}

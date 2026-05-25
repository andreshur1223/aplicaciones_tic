import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import CategoryBadge from '../components/CategoryBadge';
import InfoRow from '../components/InfoRow';
import DownloadPasswordPanel from '../components/DownloadPasswordPanel';
import { downloadUrl, publicApi } from '../api/client';

export default function AppDetail() {
    const { slug } = useParams();
    const [app, setApp] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        publicApi.application(slug)
            .then((res) => setApp(res.data.data || res.data))
            .catch(() => setError('Aplicación no encontrada.'));
    }, [slug]);

    if (error) {
        return (
            <PublicLayout>
                <p className="text-red-600">{error}</p>
                <Link to="/apps" className="text-blue-800 mt-4 inline-block">← Volver al catálogo</Link>
            </PublicLayout>
        );
    }

    if (!app) {
        return (
            <PublicLayout>
                <p className="text-slate-500">Cargando...</p>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Link to="/apps" className="text-sm text-blue-800 hover:underline mb-4 inline-block">
                ← Volver al catálogo
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex flex-wrap justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{app.name}</h1>
                        <p className="text-slate-500 mt-1">Versión {app.version}</p>
                    </div>
                    {app.requires_download_password ? (
                        <DownloadPasswordPanel app={app} fileSizeHuman={app.file_size_human} />
                    ) : (
                        <a
                            href={downloadUrl(app.slug)}
                            className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Descargar ({app.file_size_human})
                        </a>
                    )}
                </div>

                {app.is_script && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
                        <strong>Advertencia:</strong> Este archivo es un script (.bat/.ps1). Verifique su origen antes de ejecutarlo.
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
                            <h3 className="text-sm font-medium text-slate-500">Instrucciones de instalación</h3>
                            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{app.instructions || '—'}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-5 space-y-3 text-sm">
                        <InfoRow label="Sistema operativo" value={app.os} />
                        <InfoRow label="Arquitectura" value={app.architecture} />
                        <InfoRow label="Requiere administrador" value={app.requires_admin ? 'Sí' : 'No'} />
                        {app.requires_download_password && (
                            <InfoRow label="Acceso" value="Descarga con contraseña" />
                        )}
                        <InfoRow label="Tamaño" value={app.file_size_human} />
                        <InfoRow label="Descargas" value={app.download_count} />
                    </div>
                </div>

                <div className="mt-6 bg-slate-50 rounded-lg p-5 max-w-2xl">
                    <InfoRow variant="filename" label="Nombre del archivo" value={app.file_name} />
                </div>
            </div>
        </PublicLayout>
    );
}

import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import { downloadUrl } from '../api/client';

export default function AppCard({ app }) {
    return (
        <article className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
            <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-semibold text-slate-900 text-lg leading-tight">{app.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">v{app.version}</span>
            </div>
            {app.category && <CategoryBadge category={app.category} className="mb-2" />}
            <p className="text-sm text-slate-600 flex-1 line-clamp-2 mb-3">
                {app.description || 'Sin descripción'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                {app.os && <span>{app.os}</span>}
                {app.architecture && <span>• {app.architecture}</span>}
            </div>
            <div className="flex gap-2 mt-auto">
                <Link
                    to={`/apps/${app.slug}`}
                    className="flex-1 text-center text-sm py-2 px-3 border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50"
                >
                    Ver detalles
                </Link>
                {app.requires_download_password ? (
                    <Link
                        to={`/apps/${app.slug}`}
                        className="flex-1 text-center text-sm py-2 px-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                        🔒 Descargar
                    </Link>
                ) : (
                    <a
                        href={downloadUrl(app.slug)}
                        className="flex-1 text-center text-sm py-2 px-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700"
                    >
                        Descargar
                    </a>
                )}
            </div>
        </article>
    );
}

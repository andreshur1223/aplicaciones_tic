import { useState } from 'react';
import { downloadUrl, publicApi, shareDownloadUrl } from '../api/client';

export default function DownloadPasswordPanel({ app, fileSizeHuman, shareToken = null }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    const handleUnlock = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Ingrese la contraseña.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (shareToken) {
                await publicApi.unlockShareDownload(shareToken, password.trim());
            } else {
                await publicApi.unlockDownload(app.slug, password.trim());
            }
            setUnlocked(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Contraseña incorrecta.');
        } finally {
            setLoading(false);
        }
    };

    const downloadHref = shareToken ? shareDownloadUrl(shareToken) : downloadUrl(app.slug);

    if (unlocked) {
        return (
            <a
                href={downloadHref}
                className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
                Descargar ({fileSizeHuman})
            </a>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <p className="text-sm text-slate-600 mb-3">
                {shareToken
                    ? 'Esta aplicación está protegida con contraseña. Ingrese la contraseña de la aplicación para descargar por este enlace.'
                    : 'Esta aplicación es privada. Ingrese la contraseña para descargar.'}
            </p>
            <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    autoComplete="off"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? 'Verificando...' : 'Desbloquear descarga'}
                </button>
            </form>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}

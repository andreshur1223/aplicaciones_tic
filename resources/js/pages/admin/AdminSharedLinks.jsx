import { useEffect, useState } from 'react';
import { adminApi, sharePageUrl } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import IconButton, { IconCheck, IconCopy, IconExternalLink, IconPower, IconTrash } from '../../components/IconButton';

function formatExpiresAtForApi(value) {
    if (!value) return null;
    const normalized = value.replace('T', ' ');
    return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function validationMessage(err) {
    const data = err.response?.data;
    if (data?.errors) {
        return Object.values(data.errors).flat().join(' ');
    }
    return data?.message || 'No se pudo crear el enlace.';
}

function formatExpiresAt(expiresAt) {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('es', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function isExpired(expiresAt) {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
}

export default function AdminSharedLinks() {
    const [links, setLinks] = useState([]);
    const [apps, setApps] = useState([]);
    const [form, setForm] = useState({ application_id: '', expires_at: '', max_downloads: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [copied, setCopied] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = () => adminApi.sharedLinks.list().then((r) => setLinks(r.data.data || r.data));

    useEffect(() => {
        adminApi.applications.list({ all: 1 }).then((r) => {
            const list = r.data.data || r.data;
            setApps(list);
            if (list.length) {
                setForm((f) => ({ ...f, application_id: String(list[0].id) }));
            }
        });
        load();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        const appId = parseInt(form.application_id, 10);
        if (!appId || Number.isNaN(appId)) {
            setError('Seleccione una aplicación. Debe existir al menos una aplicación registrada.');
            return;
        }

        const maxDl = form.max_downloads !== '' ? parseInt(form.max_downloads, 10) : null;
        if (maxDl !== null && (Number.isNaN(maxDl) || maxDl < 1)) {
            setError('El máximo de descargas debe ser un número mayor a 0.');
            return;
        }

        if (links.some((l) => String(l.application_id) === String(appId)
            || String(l.application?.id) === String(appId))) {
            setError('Esta aplicación ya tiene un enlace compartible. Use el existente o elimínelo antes de crear otro.');
            return;
        }

        setSubmitting(true);
        try {
            await adminApi.sharedLinks.create({
                application_id: appId,
                expires_at: formatExpiresAtForApi(form.expires_at),
                max_downloads: maxDl,
            });
            setForm((f) => ({ ...f, expires_at: '', max_downloads: '' }));
            load();
        } catch (err) {
            setError(validationMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const copyLink = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const selectedApp = apps.find((a) => String(a.id) === String(form.application_id));

    const existingLinkForSelection = links.find(
        (l) => String(l.application_id) === String(form.application_id)
            || String(l.application?.id) === String(form.application_id),
    );

    const appsWithLinkIds = new Set(
        links.map((l) => String(l.application_id ?? l.application?.id)),
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Enlaces compartibles</h2>

            <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-8 max-w-xl space-y-4">
                <h3 className="font-semibold">Generar enlace</h3>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
                )}

                {apps.length === 0 ? (
                    <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                        No hay aplicaciones registradas. Cree una aplicación antes de generar enlaces compartibles.
                    </p>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aplicación</label>
                            <select
                                value={form.application_id}
                                onChange={(e) => setForm({ ...form, application_id: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >
                                {apps.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                        {appsWithLinkIds.has(String(a.id)) ? ' — ya tiene enlace' : ''}
                                        {!appsWithLinkIds.has(String(a.id)) && a.requires_download_password
                                            ? ' (requiere contraseña)'
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {existingLinkForSelection && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                                <strong>Enlace existente:</strong> esta aplicación ya tiene un enlace
                                compartible. No se puede generar otro hasta eliminarlo.
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => copyLink(
                                            existingLinkForSelection.share_url
                                                || sharePageUrl(existingLinkForSelection.token),
                                            existingLinkForSelection.id,
                                        )}
                                        className="text-blue-800 font-medium hover:underline"
                                    >
                                        {copied === existingLinkForSelection.id ? '¡Copiado!' : 'Copiar enlace actual'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedApp?.requires_download_password && !existingLinkForSelection && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                                <strong>Aplicación protegida:</strong> quien use este enlace deberá ingresar
                                la <strong>contraseña de descarga de la aplicación</strong> antes de poder
                                descargar el archivo (además de las condiciones del enlace).
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Expira el (opcional)
                            </label>
                            <input
                                type="datetime-local"
                                value={form.expires_at}
                                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Máximo de descargas (opcional)
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Sin límite"
                                value={form.max_downloads}
                                onChange={(e) => setForm({ ...form, max_downloads: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !!existingLinkForSelection}
                            className="px-4 py-2 bg-blue-800 text-white rounded-lg disabled:opacity-50"
                        >
                            {submitting ? 'Generando...' : 'Generar enlace'}
                        </button>
                    </>
                )}
            </form>

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Aplicación</th>
                            <th className="px-4 py-3 text-left">Enlace</th>
                            <th className="px-4 py-3 text-left">Descargas</th>
                            <th className="px-4 py-3 text-left">Expira</th>
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-right w-36">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <tr key={link.id} className="border-t">
                                <td className="px-4 py-3">
                                    <span>{link.application?.name}</span>
                                    {link.application?.requires_download_password && (
                                        <span className="ml-2 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                            Contraseña
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <IconButton
                                        title={copied === link.id ? '¡Copiado!' : 'Copiar enlace de página'}
                                        variant={copied === link.id ? 'success' : 'primary'}
                                        onClick={() => copyLink(link.share_url || sharePageUrl(link.token), link.id)}
                                    >
                                        {copied === link.id ? <IconCheck /> : <IconCopy />}
                                    </IconButton>
                                </td>
                                <td className="px-4 py-3">
                                    {link.current_downloads}
                                    {link.max_downloads != null && ` / ${link.max_downloads}`}
                                </td>
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                    {formatExpiresAt(link.expires_at) ? (
                                        <span className={isExpired(link.expires_at) ? 'text-amber-700 font-medium' : ''}>
                                            {formatExpiresAt(link.expires_at)}
                                            {isExpired(link.expires_at) && (
                                                <span className="block text-xs text-amber-600">Expirado</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Sin expiración</span>
                                    )}
                                </td>
                                <td className="px-4 py-3"><StatusBadge active={link.active && link.can_download} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <IconButton
                                            title="Abrir enlace en nueva pestaña"
                                            variant="primary"
                                            externalHref={link.share_url || sharePageUrl(link.token)}
                                        >
                                            <IconExternalLink />
                                        </IconButton>
                                        <IconButton
                                            title={link.active ? 'Inactivar' : 'Activar'}
                                            variant={link.active ? 'success' : 'default'}
                                            onClick={() => adminApi.sharedLinks.toggle(link.id).then(load)}
                                        >
                                            <IconPower on={link.active} />
                                        </IconButton>
                                        <IconButton
                                            title="Eliminar enlace"
                                            variant="danger"
                                            onClick={() => setDeleteId(link.id)}
                                        >
                                            <IconTrash />
                                        </IconButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Eliminar enlace"
                message="¿Eliminar este enlace compartible?"
                onConfirm={async () => {
                    await adminApi.sharedLinks.remove(deleteId);
                    setDeleteId(null);
                    load();
                }}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

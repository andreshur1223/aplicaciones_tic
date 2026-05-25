import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import IconButton, { IconCheck, IconHistory, IconPencil, IconPower, IconTag, IconTrash, IconUpload, IconX } from '../../components/IconButton';
import ApplicationVersionsModal from '../../components/ApplicationVersionsModal';
import ReplaceFileModal from '../../components/ReplaceFileModal';

const PER_PAGE = 20;

export default function AdminApplications() {
    const [apps, setApps] = useState([]);
    const [meta, setMeta] = useState(null);
    const [categories, setCategories] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [page, setPage] = useState(1);
    const [versionEdit, setVersionEdit] = useState(null);
    const [versionError, setVersionError] = useState('');
    const [fileReplaceApp, setFileReplaceApp] = useState(null);
    const [versionsApp, setVersionsApp] = useState(null);
    const [uploadLimits, setUploadLimits] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        const params = { page, per_page: PER_PAGE };
        if (search.trim()) params.search = search.trim();
        if (categoryId) params.category_id = categoryId;
        if (activeFilter !== '') params.active = activeFilter;

        return adminApi.applications.list(params)
            .then((r) => {
                setApps(r.data.data || []);
                setMeta(r.data.meta || null);
            })
            .finally(() => setLoading(false));
    }, [search, categoryId, activeFilter, page]);

    useEffect(() => {
        adminApi.categories.list().then((r) => setCategories(r.data.data || r.data));
        adminApi.uploadLimits().then((r) => setUploadLimits(r.data.data || r.data));
    }, []);

    const handleReplaceFile = async ({ file, version, onProgress }) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('version', version);
        fd.append('_method', 'PUT');
        await adminApi.applications.update(fileReplaceApp.id, fd, { onUploadProgress: onProgress });
        load();
    };

    useEffect(() => {
        const t = setTimeout(() => load(), 300);
        return () => clearTimeout(t);
    }, [load]);

    const handleDelete = async () => {
        await adminApi.applications.remove(deleteId);
        setDeleteId(null);
        load();
    };

    const startVersionEdit = (app) => {
        setVersionError('');
        setVersionEdit({ id: app.id, value: app.version });
    };

    const saveVersion = async () => {
        if (!versionEdit?.value?.trim()) {
            setVersionError('Indique una versión.');
            return;
        }
        setVersionError('');
        try {
            await adminApi.applications.updateVersion(versionEdit.id, versionEdit.value.trim());
            setVersionEdit(null);
            load();
        } catch (err) {
            setVersionError(
                err.response?.data?.message
                || Object.values(err.response?.data?.errors || {}).flat().join(' ')
                || 'No se pudo actualizar la versión.',
            );
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setActiveFilter('');
        setPage(1);
    };

    const hasFilters = search || categoryId || activeFilter !== '';

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Aplicaciones</h2>
                <Link
                    to="/admin/applications/new"
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                    + Nueva aplicación
                </Link>
            </div>

            <div className="bg-white rounded-xl border p-4 mb-6 space-y-4">
                <p className="text-xs text-slate-500">
                    La búsqueda y los filtros aplican sobre todas las aplicaciones del sistema.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Buscar</label>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Nombre, versión, categoría, SO, archivo..."
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                        <select
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todas</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                        <select
                            value={activeFilter}
                            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todas</option>
                            <option value="1">Activas</option>
                            <option value="0">Inactivas</option>
                        </select>
                    </div>
                </div>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-blue-800 hover:underline"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {versionError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{versionError}</div>
            )}

            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <p className="p-6 text-slate-500 text-sm">Cargando...</p>
                ) : apps.length === 0 ? (
                    <p className="p-6 text-slate-500 text-sm">No hay aplicaciones con estos criterios.</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[900px]">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nombre</th>
                                        <th className="px-4 py-3 text-left">Versión</th>
                                        <th className="px-4 py-3 text-left">Categoría</th>
                                        <th className="px-4 py-3 text-left">Descargas</th>
                                        <th className="px-4 py-3 text-left">Acceso</th>
                                        <th className="px-4 py-3 text-left">Estado</th>
                                        <th className="px-4 py-3 text-right w-60">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apps.map((a) => (
                                        <tr key={a.id} className="border-t hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium">{a.name}</td>
                                            <td className="px-4 py-3">
                                                {versionEdit?.id === a.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={versionEdit.value}
                                                            onChange={(e) => setVersionEdit({
                                                                ...versionEdit,
                                                                value: e.target.value,
                                                            })}
                                                            className="border rounded-lg px-2 py-1 w-24 text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveVersion();
                                                                if (e.key === 'Escape') setVersionEdit(null);
                                                            }}
                                                        />
                                                        <IconButton
                                                            title="Guardar versión"
                                                            variant="success"
                                                            onClick={saveVersion}
                                                        >
                                                            <IconCheck />
                                                        </IconButton>
                                                        <IconButton
                                                            title="Cancelar"
                                                            variant="default"
                                                            onClick={() => setVersionEdit(null)}
                                                        >
                                                            <IconX />
                                                        </IconButton>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                                                            {a.version}
                                                        </span>
                                                        <IconButton
                                                            title="Cambiar versión"
                                                            variant="warning"
                                                            onClick={() => startVersionEdit(a)}
                                                        >
                                                            <IconTag />
                                                        </IconButton>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{a.category?.name}</td>
                                            <td className="px-4 py-3">{a.download_count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {!a.visible_in_catalog && (
                                                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                                            Oculta en /apps
                                                        </span>
                                                    )}
                                                    {a.requires_download_password && (
                                                        <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                                            Con contraseña
                                                        </span>
                                                    )}
                                                    {a.visible_in_catalog && !a.requires_download_password && (
                                                        <span className="text-xs text-slate-400">Pública</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge active={a.active} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <IconButton
                                                        title={a.active ? 'Inactivar' : 'Activar'}
                                                        variant={a.active ? 'success' : 'default'}
                                                        onClick={() => adminApi.applications.toggle(a.id).then(load)}
                                                    >
                                                        <IconPower on={a.active} />
                                                    </IconButton>
                                                    {a.keep_version_history && (
                                                        <IconButton
                                                            title="Ver versiones anteriores"
                                                            variant="primary"
                                                            onClick={() => setVersionsApp(a)}
                                                        >
                                                            <IconHistory />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        title="Subir nuevo instalador"
                                                        variant="primary"
                                                        onClick={() => setFileReplaceApp(a)}
                                                    >
                                                        <IconUpload />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Editar aplicación"
                                                        variant="primary"
                                                        href={`/admin/applications/${a.id}/edit`}
                                                    >
                                                        <IconPencil />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Eliminar"
                                                        variant="danger"
                                                        onClick={() => setDeleteId(a.id)}
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
                        <Pagination meta={meta} onPageChange={setPage} />
                    </>
                )}
            </div>

            <ReplaceFileModal
                open={!!fileReplaceApp}
                app={fileReplaceApp}
                uploadLimits={uploadLimits}
                onClose={() => setFileReplaceApp(null)}
                onSubmit={handleReplaceFile}
            />

            <ApplicationVersionsModal
                open={!!versionsApp}
                app={versionsApp}
                onClose={() => setVersionsApp(null)}
                onChanged={load}
            />

            <ConfirmModal
                open={!!deleteId}
                title="Eliminar aplicación"
                message="Se eliminará la aplicación y su archivo del servidor."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

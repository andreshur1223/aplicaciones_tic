import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/client';
import ApplicationVersionsModal from '../../components/ApplicationVersionsModal';
import FileUploadInput from '../../components/FileUploadInput';
import UploadProgressBar from '../../components/UploadProgressBar';
import VersionRetentionOptions from '../../components/VersionRetentionOptions';

const ACCEPT = '.exe,.msi,.zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.bat,.ps1,.cfg';

export default function AdminApplicationForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadLimits, setUploadLimits] = useState(null);
    const [keepPrevious, setKeepPrevious] = useState(false);
    const [maxVersions, setMaxVersions] = useState(5);
    const [archivedCount, setArchivedCount] = useState(0);
    const [appName, setAppName] = useState('');
    const [appVersion, setAppVersion] = useState('');
    const [appFileName, setAppFileName] = useState('');
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);
    const [hasDownloadPassword, setHasDownloadPassword] = useState(false);
    const [downloadPassword, setDownloadPassword] = useState('');
    const [form, setForm] = useState({
        category_id: '',
        name: '',
        version: '1.0.0',
        description: '',
        instructions: '',
        os: 'Windows',
        architecture: 'x64',
        requires_admin: false,
        active: true,
        visible_in_catalog: true,
        requires_download_password: false,
    });

    useEffect(() => {
        adminApi.categories.list().then((r) => {
            const cats = r.data.data || r.data;
            setCategories(cats);
            if (!isEdit && cats.length) setForm((f) => ({ ...f, category_id: String(cats[0].id) }));
        });
        adminApi.uploadLimits().then((r) => {
            const limits = r.data.data || r.data;
            setUploadLimits(limits);
            if (!isEdit) setMaxVersions(limits.default_max_versions ?? 5);
        });
    }, [isEdit]);

    useEffect(() => {
        if (isEdit) {
            adminApi.applications.get(id).then((r) => {
                const a = r.data.data || r.data;
                setForm({
                    category_id: String(a.category_id),
                    name: a.name,
                    version: a.version,
                    description: a.description || '',
                    instructions: a.instructions || '',
                    os: a.os || '',
                    architecture: a.architecture || '',
                    requires_admin: a.requires_admin,
                    active: a.active,
                    visible_in_catalog: a.visible_in_catalog ?? true,
                    requires_download_password: a.requires_download_password ?? false,
                });
                setHasDownloadPassword(Boolean(a.has_download_password));
                setDownloadPassword('');
                setKeepPrevious(Boolean(a.keep_version_history));
                setMaxVersions(a.max_versions_to_keep ?? uploadLimits?.default_max_versions ?? 5);
                setArchivedCount(a.archived_versions_count ?? 0);
                setAppName(a.name);
                setAppVersion(a.version);
                setAppFileName(a.file_name);
            });
        }
    }, [id, isEdit]);

    const buildFormData = () => {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (['requires_admin', 'active', 'visible_in_catalog', 'requires_download_password'].includes(k)) {
                fd.append(k, v ? '1' : '0');
            } else {
                fd.append(k, v);
            }
        });
        if (form.requires_download_password && downloadPassword.trim()) {
            fd.append('download_password', downloadPassword.trim());
        }
        fd.append('keep_version_history', keepPrevious ? '1' : '0');
        if (keepPrevious) {
            fd.append('max_versions_to_keep', String(maxVersions));
        }
        if (file) fd.append('file', file);
        if (isEdit) fd.append('_method', 'PUT');
        return fd;
    };

    const versionsModalApp = isEdit ? {
        id: Number(id),
        name: appName || form.name,
        version: appVersion || form.version,
        file_name: appFileName,
        keep_version_history: keepPrevious,
    } : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEdit && !file) {
            setError('Debe seleccionar un archivo instalador.');
            return;
        }
        if (form.requires_download_password) {
            const needsPassword = !isEdit || !hasDownloadPassword;
            if (needsPassword && !downloadPassword.trim()) {
                setError('Indique una contraseña de descarga para aplicaciones privadas.');
                return;
            }
        }

        const maxBytes = uploadLimits?.effective_max_bytes;
        if (file && maxBytes && file.size > maxBytes) {
            setError(
                `El archivo (${(file.size / 1048576).toFixed(2)} MB) supera el límite permitido `
                + `(${uploadLimits.effective_max_human}). Ajuste php.ini o REPOSITORIO_MAX_UPLOAD_KB.`,
            );
            return;
        }

        setError('');
        setLoading(true);
        setUploadProgress(file ? 0 : null);

        const onUploadProgress = file
            ? (event) => {
                if (event.total) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(Math.min(percent, 100));
                } else if (event.loaded > 0) {
                    setUploadProgress(-1);
                }
            }
            : undefined;

        try {
            const fd = buildFormData();
            const options = { onUploadProgress };

            if (isEdit) {
                await adminApi.applications.update(id, fd, options);
            } else {
                await adminApi.applications.create(fd, options);
            }
            setUploadProgress(100);
            navigate('/admin/applications');
        } catch (err) {
            const data = err.response?.data;
            let msg = data?.message
                || Object.values(data?.errors || {}).flat().join(' ')
                || 'Error al guardar.';
            if (err.response?.status === 413) {
                msg = [msg, data?.hint].filter(Boolean).join(' ');
            }
            setError(msg);
        } finally {
            setLoading(false);
            setUploadProgress(null);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Editar aplicación' : 'Nueva aplicación'}</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

            {uploadLimits && uploadLimits.effective_max_bytes < 400 * 1024 * 1024 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-lg">
                    <strong>Límite del servidor ({uploadLimits.effective_max_human}):</strong> PHP solo permite{' '}
                    {uploadLimits.php_post_max_size} por petición. Para archivos de ~358 MB o más, suba{' '}
                    <code className="bg-amber-100 px-1 rounded">post_max_size</code> y{' '}
                    <code className="bg-amber-100 px-1 rounded">upload_max_filesize</code> a 1G–2G en php.ini
                    y reinicie el servidor. Vea <code className="bg-amber-100 px-1 rounded">docs/php-upload-limits.ini.example</code>.
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4" aria-busy={loading}>
                <div>
                    <label className="block text-sm font-medium mb-1">Categoría *</label>
                    <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <input
                    placeholder="Nombre *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                />
                <input
                    placeholder="Versión *"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                />
                <textarea
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                />
                <textarea
                    placeholder="Instrucciones de instalación"
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={4}
                />
                <div className="grid grid-cols-2 gap-4">
                    <input
                        placeholder="Sistema operativo"
                        value={form.os}
                        onChange={(e) => setForm({ ...form, os: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                    />
                    <input
                        placeholder="Arquitectura"
                        value={form.architecture}
                        onChange={(e) => setForm({ ...form, architecture: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                    />
                </div>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.requires_admin}
                        onChange={(e) => setForm({ ...form, requires_admin: e.target.checked })}
                    />
                    Requiere permisos de administrador
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    Activa (disponible para descarga)
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800">Visibilidad y acceso</h4>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.visible_in_catalog}
                            onChange={(e) => setForm({ ...form, visible_in_catalog: e.target.checked })}
                            className="mt-1 rounded border-slate-300"
                        />
                        <span>
                            <span className="block text-sm font-medium text-slate-800">
                                Visible en el catálogo (/apps)
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                                Si está desactivado, no aparece en el listado público (sigue accesible por URL directa si está activa).
                            </span>
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.requires_download_password}
                            onChange={(e) => setForm({
                                ...form,
                                requires_download_password: e.target.checked,
                            })}
                            className="mt-1 rounded border-slate-300"
                        />
                        <span>
                            <span className="block text-sm font-medium text-slate-800">
                                Descarga protegida con contraseña
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                                Los usuarios deben ingresar la contraseña antes de descargar.
                            </span>
                        </span>
                    </label>
                    {form.requires_download_password && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Contraseña de descarga
                                {isEdit && hasDownloadPassword && (
                                    <span className="font-normal text-slate-500"> (dejar vacío para no cambiar)</span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={downloadPassword}
                                onChange={(e) => setDownloadPassword(e.target.value)}
                                placeholder={isEdit && hasDownloadPassword ? 'Nueva contraseña (opcional)' : 'Mínimo 4 caracteres'}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                autoComplete="new-password"
                            />
                        </div>
                    )}
                </div>

                <VersionRetentionOptions
                    keepPrevious={keepPrevious}
                    onKeepPreviousChange={setKeepPrevious}
                    maxVersions={maxVersions}
                    onMaxVersionsChange={setMaxVersions}
                    uploadLimits={uploadLimits}
                    archivedCount={archivedCount}
                    disabled={loading}
                    showViewVersions={isEdit}
                    onViewVersions={isEdit ? () => setVersionsModalOpen(true) : null}
                />

                <FileUploadInput
                    value={file}
                    onChange={setFile}
                    accept={ACCEPT}
                    label={isEdit ? 'Reemplazar archivo (opcional)' : 'Archivo instalador *'}
                    maxBytes={uploadLimits?.effective_max_bytes}
                    maxHuman={uploadLimits?.effective_max_human}
                />

                <UploadProgressBar
                    progress={uploadProgress}
                    label={
                        isEdit && file
                            ? 'Reemplazando archivo...'
                            : 'Subiendo instalador...'
                    }
                />

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-800 text-white rounded-lg disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/applications')}
                        disabled={loading}
                        className="px-6 py-2 border rounded-lg disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </form>

            <ApplicationVersionsModal
                open={versionsModalOpen}
                app={versionsModalApp}
                onClose={() => setVersionsModalOpen(false)}
                onChanged={() => {
                    adminApi.applications.get(id).then((r) => {
                        const a = r.data.data || r.data;
                        setArchivedCount(a.archived_versions_count ?? 0);
                    });
                }}
            />
        </div>
    );
}

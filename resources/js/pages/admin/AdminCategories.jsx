import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import IconButton, { IconPencil, IconPower, IconTrash } from '../../components/IconButton';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', icon: '' });
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState('');

    const load = () => adminApi.categories.list().then((r) => setCategories(r.data.data || r.data));

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm({ name: '', description: '', icon: '' });
        setEditing(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editing) {
                await adminApi.categories.update(editing, form);
            } else {
                await adminApi.categories.create(form);
            }
            resetForm();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar.');
        }
    };

    const handleDelete = async () => {
        try {
            await adminApi.categories.remove(deleteId);
            setDeleteId(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar.');
            setDeleteId(null);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Categorías</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-8 max-w-xl space-y-4">
                <h3 className="font-semibold">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <input
                    placeholder="Nombre *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                />
                <input
                    placeholder="Icono (emoji)"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                />
                <textarea
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                />
                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-800 text-white rounded-lg">
                        {editing ? 'Actualizar' : 'Crear'}
                    </button>
                    {editing && (
                        <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Nombre</th>
                            <th className="px-4 py-3 text-left">Apps</th>
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-right w-36">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} className="border-t">
                                <td className="px-4 py-3">{c.icon} {c.name}</td>
                                <td className="px-4 py-3">{c.applications_count ?? 0}</td>
                                <td className="px-4 py-3"><StatusBadge active={c.active} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <IconButton
                                            title={c.active ? 'Inactivar' : 'Activar'}
                                            variant={c.active ? 'success' : 'default'}
                                            onClick={() => adminApi.categories.toggle(c.id).then(load)}
                                        >
                                            <IconPower on={c.active} />
                                        </IconButton>
                                        <IconButton
                                            title="Editar categoría"
                                            variant="primary"
                                            onClick={() => {
                                                setEditing(c.id);
                                                setForm({
                                                    name: c.name,
                                                    description: c.description || '',
                                                    icon: c.icon || '',
                                                });
                                            }}
                                        >
                                            <IconPencil />
                                        </IconButton>
                                        <IconButton
                                            title="Eliminar categoría"
                                            variant="danger"
                                            onClick={() => setDeleteId(c.id)}
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
                title="Eliminar categoría"
                message="¿Confirma eliminar esta categoría? Solo es posible si no tiene aplicaciones."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

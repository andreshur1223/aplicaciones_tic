import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';

export default function AdminDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        adminApi.dashboard().then((res) => setData(res.data));
    }, []);

    if (!data) return <p className="text-slate-500">Cargando...</p>;

    const cards = [
        { label: 'Total aplicaciones', value: data.stats.total_applications, color: 'bg-blue-800' },
        { label: 'Aplicaciones activas', value: data.stats.active_applications, color: 'bg-green-600' },
        { label: 'Categorías', value: data.stats.total_categories, color: 'bg-slate-700' },
        { label: 'Total descargas', value: data.stats.total_downloads, color: 'bg-indigo-600' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((c) => (
                    <div key={c.label} className={`${c.color} text-white rounded-xl p-5 shadow`}>
                        <p className="text-sm opacity-90">{c.label}</p>
                        <p className="text-3xl font-bold mt-1">{c.value}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Últimas descargas</h3>
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3">Aplicación</th>
                            <th className="px-4 py-3">IP</th>
                            <th className="px-4 py-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.recent_downloads?.data || data.recent_downloads || []).map((log) => (
                            <tr key={log.id} className="border-t">
                                <td className="px-4 py-3">{log.application?.name || '—'}</td>
                                <td className="px-4 py-3">{log.ip_address}</td>
                                <td className="px-4 py-3">{new Date(log.downloaded_at).toLocaleString('es')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

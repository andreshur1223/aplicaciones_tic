import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';

export default function AdminDownloadLogs() {
    const [logs, setLogs] = useState([]);
    const [apps, setApps] = useState([]);
    const [filters, setFilters] = useState({ application_id: '', date_from: '', date_to: '' });

    useEffect(() => {
        adminApi.applications.list({ all: 1 }).then((r) => setApps(r.data.data || r.data));
    }, []);

    useEffect(() => {
        const params = {};
        if (filters.application_id) params.application_id = filters.application_id;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;
        adminApi.downloadLogs(params).then((r) => setLogs(r.data.data || r.data));
    }, [filters]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Historial de descargas</h2>

            <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border">
                <select
                    value={filters.application_id}
                    onChange={(e) => setFilters({ ...filters, application_id: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Todas las aplicaciones</option>
                    {apps.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                />
            </div>

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Aplicación</th>
                            <th className="px-4 py-3 text-left">IP</th>
                            <th className="px-4 py-3 text-left">User Agent</th>
                            <th className="px-4 py-3 text-left">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-t">
                                <td className="px-4 py-3">{log.application?.name}</td>
                                <td className="px-4 py-3">{log.ip_address}</td>
                                <td className="px-4 py-3 max-w-xs truncate" title={log.user_agent}>{log.user_agent}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {new Date(log.downloaded_at).toLocaleString('es')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

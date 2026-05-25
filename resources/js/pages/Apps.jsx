import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import AppCard from '../components/AppCard';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import { publicApi } from '../api/client';

const PER_PAGE = 15; // 3 columnas × 5 filas

export default function Apps() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [meta, setMeta] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    const loadApps = useCallback(() => {
        setLoading(true);
        publicApi.applications({
            category: category || undefined,
            search: search || undefined,
            page,
            per_page: PER_PAGE,
        })
            .then((res) => {
                setApplications(res.data.data || []);
                setMeta(res.data.meta || null);
            })
            .finally(() => setLoading(false));
    }, [category, search, page]);

    useEffect(() => {
        publicApi.categories().then((res) => setCategories(res.data.data || res.data));
    }, []);

    useEffect(() => {
        loadApps();
    }, [loadApps]);

    const setFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.delete('page');
        setSearchParams(params);
    };

    const setPage = (p) => {
        const params = new URLSearchParams(searchParams);
        if (p > 1) params.set('page', String(p));
        else params.delete('page');
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <PublicLayout>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Catálogo de aplicaciones</h2>

            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="lg:w-64 flex-shrink-0">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setFilter('category', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                        <option value="">Todas</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                    <SearchInput
                        onSearch={(q) => setFilter('search', q)}
                        placeholder="Nombre de la aplicación..."
                        className="w-full"
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-slate-500">Cargando...</p>
            ) : applications.length === 0 ? (
                <p className="text-slate-500">No se encontraron aplicaciones.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <AppCard key={app.id} app={app} />
                        ))}
                    </div>

                    {meta && (
                        <div className="mt-8 bg-white rounded-xl border overflow-hidden">
                            <Pagination meta={meta} onPageChange={setPage} />
                        </div>
                    )}
                </>
            )}
        </PublicLayout>
    );
}

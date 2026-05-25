import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import AppCard from '../components/AppCard';
import SearchInput from '../components/SearchInput';
import { publicApi } from '../api/client';

export default function Home() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            publicApi.categories(),
            publicApi.applications({ per_page: 6 }),
        ])
            .then(([catRes, appRes]) => {
                setCategories(catRes.data.data || catRes.data);
                const apps = appRes.data.data || appRes.data;
                setApplications(apps.slice(0, 6));
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (q) => {
        navigate(q ? `/apps?search=${encodeURIComponent(q)}` : '/apps');
    };

    return (
        <PublicLayout>
            <div className="mb-8 max-w-xl mx-auto">
                <SearchInput onSearch={handleSearch} placeholder="Buscar aplicaciones por nombre..." className="w-full" />
            </div>

            <section className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                    Centro de Aplicaciones TIC
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Descargue e instale aplicaciones autorizadas para su equipo desde la red interna corporativa.
                </p>
            </section>

            <section className="mb-12">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Categorías</h3>
                {loading ? (
                    <p className="text-slate-500">Cargando...</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/apps?category=${cat.slug}`}
                                className="bg-white border border-slate-200 rounded-lg p-4 text-center hover:border-blue-300 hover:shadow transition"
                            >
                                <span className="text-2xl block mb-1">{cat.icon || '📁'}</span>
                                <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Aplicaciones destacadas</h3>
                    <Link to="/apps" className="text-sm text-blue-800 hover:underline">
                        Ver todas →
                    </Link>
                </div>
                {loading ? (
                    <p className="text-slate-500">Cargando aplicaciones...</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <AppCard key={app.id} app={app} />
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}

import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { adminApi } from '../api/client';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await adminApi.logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow">
                    <h1 className="text-lg font-semibold">Panel administrativo</h1>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm text-slate-300 hover:text-white">
                            Ver portal público
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}

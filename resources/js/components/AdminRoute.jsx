import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminApi, ensureCsrfCookie } from '../api/client';
import AdminLayout from './AdminLayout';

export default function AdminRoute() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        ensureCsrfCookie()
            .then(() => adminApi.me())
            .then((res) => setAuthenticated(!!res.data.user))
            .catch(() => setAuthenticated(false))
            .finally(() => setLoading(false));
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-slate-600">Cargando...</p>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
}

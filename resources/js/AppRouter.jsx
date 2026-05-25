import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { resolveBasePath } from './api/client';
import Home from './pages/Home';
import Apps from './pages/Apps';
import AppDetail from './pages/AppDetail';
import SharedDownload from './pages/SharedDownload';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationForm from './pages/admin/AdminApplicationForm';
import AdminDownloadLogs from './pages/admin/AdminDownloadLogs';
import AdminSharedLinks from './pages/admin/AdminSharedLinks';
import AdminRoute from './components/AdminRoute';

const basename = resolveBasePath();

export default function AppRouter() {
    return (
        <BrowserRouter basename={basename || undefined}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/apps/:slug" element={<AppDetail />} />
                <Route path="/share/:token" element={<SharedDownload />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="applications" element={<AdminApplications />} />
                    <Route path="applications/new" element={<AdminApplicationForm />} />
                    <Route path="applications/:id/edit" element={<AdminApplicationForm />} />
                    <Route path="download-logs" element={<AdminDownloadLogs />} />
                    <Route path="shared-links" element={<AdminSharedLinks />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

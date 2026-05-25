import { NavLink } from 'react-router-dom';

const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/categories', label: 'Categorías' },
    { to: '/admin/applications', label: 'Aplicaciones' },
    { to: '/admin/download-logs', label: 'Historial descargas' },
    { to: '/admin/shared-links', label: 'Enlaces compartibles' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-slate-200 flex-shrink-0 hidden md:block">
            <div className="p-4 border-b border-slate-700">
                <p className="text-xs uppercase tracking-wider text-slate-400">Administración</p>
            </div>
            <nav className="p-3 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded text-sm ${
                                isActive ? 'bg-blue-800 text-white' : 'hover:bg-slate-800'
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

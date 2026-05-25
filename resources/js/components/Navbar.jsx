import { Link } from 'react-router-dom';
import SearchInput from './SearchInput';

export default function Navbar({ onSearch }) {
    return (
        <header className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-800 flex items-center justify-center text-white font-bold">
                            TIC
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Centro de Aplicaciones TIC</h1>
                            <p className="text-xs text-slate-500">Repositorio interno de software</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 flex-1 md:max-w-md md:ml-auto">
                        {onSearch && <SearchInput onSearch={onSearch} placeholder="Buscar aplicaciones..." className="w-full" />}
                        <Link
                            to="/apps"
                            className="whitespace-nowrap text-sm font-medium text-blue-800 hover:text-blue-600"
                        >
                            Todas las apps
                        </Link>
                        <Link
                            to="/admin/login"
                            className="whitespace-nowrap text-sm text-slate-500 hover:text-slate-700"
                        >
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

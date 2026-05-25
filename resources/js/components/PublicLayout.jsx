import Navbar from './Navbar';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="border-t border-slate-200 bg-white mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
                    Centro de Aplicaciones TIC — Red interna corporativa
                </div>
            </footer>
        </div>
    );
}

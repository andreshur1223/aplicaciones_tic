export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const { current_page, last_page, from, to, total } = meta;

    const pages = [];
    const delta = 2;
    const left = Math.max(2, current_page - delta);
    const right = Math.min(last_page - 1, current_page + delta);

    pages.push(1);
    if (left > 2) pages.push('…');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < last_page - 1) pages.push('…');
    if (last_page > 1) pages.push(last_page);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-slate-50 text-sm">
            <p className="text-slate-600">
                Mostrando <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> de{' '}
                <span className="font-medium">{total}</span>
            </p>
            <nav className="flex items-center gap-1" aria-label="Paginación">
                <PageBtn
                    disabled={current_page <= 1}
                    onClick={() => onPageChange(current_page - 1)}
                    label="Anterior"
                >
                    ‹
                </PageBtn>
                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
                    ) : (
                        <PageBtn
                            key={p}
                            active={p === current_page}
                            onClick={() => onPageChange(p)}
                            label={`Página ${p}`}
                        >
                            {p}
                        </PageBtn>
                    ),
                )}
                <PageBtn
                    disabled={current_page >= last_page}
                    onClick={() => onPageChange(current_page + 1)}
                    label="Siguiente"
                >
                    ›
                </PageBtn>
            </nav>
        </div>
    );
}

function PageBtn({ children, onClick, disabled, active, label }) {
    return (
        <button
            type="button"
            title={label}
            disabled={disabled}
            onClick={onClick}
            className={`min-w-[2.25rem] h-9 px-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                    ? 'bg-blue-800 text-white border-blue-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );
}

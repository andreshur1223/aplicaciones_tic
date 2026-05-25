/**
 * Fila de detalle. variant="filename" para nombres largos (.cfg, instaladores, etc.)
 */
export default function InfoRow({ label, value, variant = 'default' }) {
    const display = value ?? '—';

    if (variant === 'filename') {
        return (
            <div className="border-b border-slate-200 pb-3 last:border-0">
                <span className="block text-sm font-medium text-slate-500 mb-1.5">{label}</span>
                <p
                    className="font-mono text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 break-all leading-relaxed"
                    title={typeof display === 'string' ? display : undefined}
                >
                    {display}
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-2 last:border-0">
            <span className="text-slate-500 shrink-0">{label}</span>
            <span className="font-medium text-slate-800 text-right break-words max-w-[60%]">
                {display}
            </span>
        </div>
    );
}

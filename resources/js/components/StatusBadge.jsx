export default function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex text-xs font-medium px-2 py-0.5 rounded ${
                active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
            {active ? 'Activo' : 'Inactivo'}
        </span>
    );
}

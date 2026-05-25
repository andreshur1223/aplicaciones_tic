export default function CategoryBadge({ category, className = '' }) {
    if (!category) return null;

    return (
        <span className={`inline-flex items-center text-xs font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded ${className}`}>
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
        </span>
    );
}

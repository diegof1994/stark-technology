import { CATEGORY_ICONS, IconCheck } from './Icons.jsx';

/**
 * CategoryFilter - Selector de rubros para el rail de filtros.
 *
 * Lista vertical con icono, nombre y conteo de productos. La fila activa se
 * marca con fondo de acento y un check.
 */
export default function CategoryFilter({
  categories = [],
  selected = 'all',
  onSelect,
  className = '',
}) {
  const total = categories.reduce((acc, category) => acc + (category.count ?? 0), 0);

  const options = [
    { id: 'all', label: 'Todos los rubros', count: total },
    ...categories.map((category) => ({
      id: category.id,
      label: category.label,
      count: category.count ?? 0,
    })),
  ];

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="tech-label text-accent">Rubros</h3>
        <span className="font-mono text-[10px] text-faint">
          {options.length} categorias
        </span>
      </div>

      <ul className="space-y-0.5">
        {options.map((option) => {
          const isActive = selected === option.id;
          const CategoryIcon = CATEGORY_ICONS[option.id];

          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect?.(option.id)}
                aria-pressed={isActive}
                className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                  isActive
                    ? 'bg-accent/12 font-medium text-accent'
                    : 'text-muted hover:bg-surface-3 hover:text-strong'
                }`}
              >
                {isActive ? (
                  <IconCheck className="h-3.5 w-3.5 shrink-0" />
                ) : CategoryIcon ? (
                  <CategoryIcon className="h-3.5 w-3.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0" />
                )}

                <span className="min-w-0 flex-1 leading-snug">{option.label}</span>

                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tabular ${
                    isActive ? 'bg-accent/15 text-accent' : 'bg-surface-3 text-faint'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

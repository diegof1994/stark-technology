import { CATEGORY_ICONS, IconCheck, IconFilter } from './Icons.jsx';

/**
 * CategoryFilter - Selector de rubros interactivo.
 * Muestra los 10 rubros con su icono, conteo y estado activo.
 */
export default function CategoryFilter({
  categories = [],
  selected = 'all',
  onSelect,
  className = '',
}) {
  const total = categories.reduce((acc, category) => acc + (category.count ?? 0), 0);

  const options = [
    { id: 'all', label: 'Todos los rubros', shortLabel: 'Todos', count: total },
    ...categories.map((category) => ({
      id: category.id,
      label: category.label,
      shortLabel: category.shortLabel ?? category.label,
      count: category.count ?? 0,
      cover: category.cover,
    })),
  ];

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <IconFilter className="h-4 w-4 text-ember-400" />
        <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Rubros
        </h3>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          {options.length} categorias
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected === option.id;
          const CategoryIcon = CATEGORY_ICONS[option.id];

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect?.(option.id)}
              aria-pressed={isActive}
              className={`group relative inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'border-ember-400/70 bg-ember-500/12 text-ember-300 shadow-ember'
                  : 'border-ink-600/70 bg-ink-850/60 text-slate-400 hover:border-ember-500/50 hover:text-slate-100'
              }`}
            >
              {isActive ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : CategoryIcon ? (
                <CategoryIcon className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
              ) : null}
              <span>{option.shortLabel}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                  isActive
                    ? 'bg-ember-400/20 text-ember-200'
                    : 'bg-ink-700/70 text-slate-500'
                }`}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

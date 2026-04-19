/**
 * PersonaGrid — a 2×2 grid of selectable persona cards.
 */

const PERSONA_LIST = [
  {
    id: 'react',
    name: 'React Dev',
    desc: 'Components, hooks & state',
    icon: '⚛️',
    variant: 'react',
  },
  {
    id: 'datascience',
    name: 'Data Scientist',
    desc: 'Models, pipelines & features',
    icon: '📊',
    variant: 'datascience',
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    desc: 'Containers, CI/CD & infra',
    icon: '🚀',
    variant: 'devops',
  },
  {
    id: 'designer',
    name: 'UI/UX Designer',
    desc: 'Flows, systems & affordances',
    icon: '🎨',
    variant: 'designer',
  },
];

export default function PersonaGrid({ selected, onSelect }) {
  return (
    <div className="persona-section">
      <span className="input-label">🎭 Pick your stack</span>
      <div className="persona-grid" role="radiogroup" aria-label="Choose a persona">
        {PERSONA_LIST.map((p) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              id={`persona-${p.id}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`persona-card persona-card--${p.variant} ${
                isActive ? 'persona-card--active' : ''
              }`}
              onClick={() => onSelect(p.id)}
            >
              <div className="persona-card__icon">{p.icon}</div>
              <div className="persona-card__info">
                <span className="persona-card__name">{p.name}</span>
                <span className="persona-card__desc">{p.desc}</span>
              </div>
              <span className="persona-card__check" aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

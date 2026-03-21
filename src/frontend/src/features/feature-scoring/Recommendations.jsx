/**
 * Feature: Scoring — Recommendations
 * Cards showing ranked improvement actions with score impact estimates.
 * 
 * TODO (Teammate 1):
 * - Add expandable detail view
 * - Add effort icons (easy/medium/hard)
 * - Support Hindi via language toggle
 */

export default function Recommendations({ recommendations, language = 'en' }) {
  if (!recommendations || recommendations.length === 0) return null

  const effortColors = {
    low: { bg: 'bg-green-400/10', text: 'text-green-400', label: 'Easy' },
    medium: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', label: 'Medium' },
    high: { bg: 'bg-red-400/10', text: 'text-red-400', label: 'Hard' },
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'hi' ? 'सुधार की सिफारिशें' : 'Improvement Recommendations'}
      </h3>

      <div className="space-y-3 fade-in-stagger">
        {recommendations.map((rec, i) => {
          const effort = effortColors[rec.effort] || effortColors.medium
          return (
            <div key={i} className="glass-light rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {language === 'hi' ? rec.action_hi : rec.action}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {language === 'hi' ? rec.explanation_hi : rec.explanation}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-400">
                    +{rec.impact_min}-{rec.impact_max} pts
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${effort.bg} ${effort.text}`}>
                      {effort.label}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {rec.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

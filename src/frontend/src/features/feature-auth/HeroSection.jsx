/**
 * Feature: Auth — HeroSection
 * Landing page hero with value prop and CTAs.
 * 
 * TODO (Teammate 2):
 * - Add animated background elements
 * - Add stat counters (190M+ credit invisible, etc.)
 * - Refine copy and typography
 */

export default function HeroSection({ onSignUp, onTryDemo }) {
  return (
    <div className="min-h-screen animated-gradient flex flex-col items-center justify-center px-4 text-center">
      {/* Hero content */}
      <div className="max-w-3xl mx-auto fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full glass-light text-sm font-medium text-[var(--color-primary-light)] mb-6">
          🇮🇳 Built for 190M+ credit-invisible Indians
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Your Financial Behavior
          <span className="gradient-primary bg-clip-text text-transparent"> Is Your Credit Score</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
          No bank loans? No credit cards? No problem. We score you on what matters — how you spend, save, and pay your bills.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onSignUp}
            className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Get Your Score →
          </button>
          <button
            onClick={onTryDemo}
            className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all"
          >
            Try a Demo Persona
          </button>
        </div>
      </div>

      {/* Persona cards preview */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-stagger">
        <PersonaPreviewCard
          emoji="🛵"
          name="Ravi"
          title="Delivery Partner"
          score="~540"
          onClick={() => onTryDemo?.('ravi')}
        />
        <PersonaPreviewCard
          emoji="📚"
          name="Priya"
          title="College Student"
          score="~480"
          onClick={() => onTryDemo?.('priya')}
        />
        <PersonaPreviewCard
          emoji="🏪"
          name="Mohan"
          title="Kirana Owner"
          score="~620"
          onClick={() => onTryDemo?.('mohan')}
        />
      </div>
    </div>
  )
}

function PersonaPreviewCard({ emoji, name, title, score, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-5 text-left hover:bg-white/10 transition-all hover:scale-105 cursor-pointer group"
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">{title}</p>
      <p className="text-sm font-medium text-[var(--color-primary-light)] mt-2 group-hover:underline">
        Score: {score} — Click to explore →
      </p>
    </button>
  )
}

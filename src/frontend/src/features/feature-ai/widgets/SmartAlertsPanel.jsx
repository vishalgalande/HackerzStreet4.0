import { motion } from 'framer-motion'

export default function SmartAlertsPanel({ profile }) {
  const alerts = [
    { type: 'risk', icon: '🚨', title: 'High Credit Utilization', desc: 'Your discretionary spending pushed utilization above 30%.', time: '2 hours ago' },
    { type: 'warning', icon: '⚠️', title: 'Impulse Spending Detected', desc: 'Unusual weekend activity detected. Score growth paused.', time: 'Yesterday' },
    { type: 'good', icon: '✅', title: 'Consistent Saver', desc: 'Maintained 20% savings buffer for 3 consecutive months.', time: 'Oct 12' },
  ]

  const alertStyles = {
    risk: { card: 'bg-rose-500/10 border border-rose-500/20', title: 'text-rose-400' },
    warning: { card: 'bg-amber-500/10 border border-amber-500/20', title: 'text-amber-400' },
    good: { card: 'bg-emerald-500/10 border border-emerald-500/20', title: 'text-emerald-400' },
  }

  const traits = [
    { label: 'Personality', value: 'Moderate Spender', icon: '👤', highlight: 'text-neutral-50' },
    { label: 'Risk Tolerance', value: 'Strategic & Controlled', icon: '⚖️', highlight: 'text-emerald-400' },
    { label: 'Improvement Area', value: 'Weekend Impulse Control', icon: '🎯', highlight: 'text-amber-400' },
  ]

  return (
    <div className="flex flex-col gap-10">
      
      {/* System Profile */}
      <div className="w-full flex flex-col gap-4">
        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2 pl-1">
          <span>🧠</span> System Profile
        </h3>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            {traits.map((trait, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 ${i > 0 ? 'pt-6 md:pt-0 md:pl-6' : ''}`}
              >
                <div className="w-11 h-11 rounded-full bg-neutral-950 flex items-center justify-center text-xl shrink-0 border border-neutral-800">
                  {trait.icon}
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{trait.label}</p>
                  <p className={`text-lg font-medium ${trait.highlight}`}>{trait.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Triggers */}
      <div className="w-full flex flex-col gap-4">
        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-2 pl-1">
          <span>⚡</span> Active Triggers
        </h3>
        
        <div className="flex flex-col gap-3">
          {alerts.map((alert, i) => {
            const style = alertStyles[alert.type]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${style.card} rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-950/50 flex items-center justify-center text-lg shrink-0">
                    {alert.icon}
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-bold ${style.title} mb-1`}>{alert.title}</h4>
                    <p className="text-[14px] text-neutral-300 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="text-xs text-neutral-500">{alert.time}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      
    </div>
  )
}

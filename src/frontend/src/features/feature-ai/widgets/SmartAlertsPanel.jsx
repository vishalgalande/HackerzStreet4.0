import { motion } from 'framer-motion'

export default function SmartAlertsPanel({ profile }) {
  // Mock alerts demonstrating color coding and UI
  const alerts = [
    { type: 'risk', icon: '🚨', title: 'High Credit Utilization', desc: 'Your discretionary spending pushed utilization above 30%.', time: '2 hours ago', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
    { type: 'warning', icon: '⚠️', title: 'Impulse Spending Detected', desc: 'Unusual weekend activity detected. Score growth paused.', time: 'Yesterday', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    { type: 'good', icon: '✅', title: 'Consistent Saver', desc: 'Maintained 20% savings buffer for 3 consecutive months.', time: 'Oct 12', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  ]

  const traits = [
    { label: 'Personality', value: 'Moderate Spender', icon: '👤', highlight: 'text-slate-200' },
    { label: 'Risk Tolerance', value: 'Strategic & Controlled', icon: '⚖️', highlight: 'text-emerald-400' },
    { label: 'Improvement Area', value: 'Weekend Impulse Control', icon: '🎯', highlight: 'text-amber-400' },
  ]

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      
      {/* AI Financial Profile (Left - col-span-4) */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <h3 className="text-[14px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-6 flex items-center gap-2">
          <span>🧠</span> System Profile
        </h3>
        
        {traits.map((trait, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 hover:bg-slate-800/80 transition-colors shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-xl shadow-inner border border-slate-700/50">
              {trait.icon}
            </div>
            <div>
              <p className="text-[14px] text-slate-500 uppercase tracking-wider mb-1">{trait.label}</p>
              <p className={`text-[16px] font-medium ${trait.highlight}`}>{trait.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Alerts (Right - col-span-8) */}
      <div className="col-span-12 lg:col-span-8">
        <h3 className="text-[14px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-6 flex items-center gap-2">
          <span>⚡</span> Active Triggers
        </h3>
        
        <div className="grid gap-4">
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${alert.bg} ${alert.border} border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:brightness-110 transition-all`}
            >
              <div className="flex items-start md:items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-slate-900/50 flex items-center justify-center text-lg shrink-0">
                  {alert.icon}
                </div>
                <div>
                  <h4 className={`text-[15px] font-bold ${alert.text} mb-1`}>{alert.title}</h4>
                  <p className="text-[14px] text-slate-300 leading-relaxed">{alert.desc}</p>
                </div>
              </div>
              <div className="text-left md:text-right shrink-0">
                <span className="text-[13px] font-medium text-slate-500">{alert.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

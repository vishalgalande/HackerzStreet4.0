import { motion } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import LiquidFundWidget from './widgets/LiquidFundWidget'
import LongTermWealthWidget from './widgets/LongTermWealthWidget'
import SmartSavingsWidget from './widgets/SmartSavingsWidget'
import SmartAlertsPanel from './widgets/SmartAlertsPanel'

export default function ChimcharAssistant() {
  const { profile } = useAuth()

  return (
    <div className="page-container pb-16" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* TOP: Greeting Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 flex flex-col items-center pt-8 mb-4 lg:mb-12"
      >
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(234,88,12,0.6)] border border-orange-300/50">
            🔥
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Chimchar</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-[15px] md:text-base leading-relaxed">
          Your personal financial intelligence core. Review my automated insights beneath to optimize your credit score and build lifelong wealth.
        </p>
      </motion.div>

      {/* MIDDLE: 3 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true }} transition={{ delay: 0.1 }}>
          <SmartSavingsWidget />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true }} transition={{ delay: 0.2 }}>
          <LongTermWealthWidget />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true }} transition={{ delay: 0.3 }}>
          <LiquidFundWidget />
        </motion.div>
      </div>

      {/* BOTTOM: AI Financial Profile & Smart Alerts */}
      <div className="pt-10 border-t border-slate-800/50">
        <SmartAlertsPanel profile={profile} />
      </div>

    </div>
  )
}

/**
 * Feature: Scoring — FactorWaterfall
 * Chart.js waterfall/bar chart showing factor contributions.
 * 
 * TODO (Teammate 1):
 * - Add tooltip with detailed descriptions
 * - Animate bars on load
 * - Support Hindi labels via language toggle
 */

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function FactorWaterfall({ factors, language = 'en' }) {
  if (!factors || factors.length === 0) return null

  const sortedFactors = [...factors].sort((a, b) => b.points - a.points)

  const labels = sortedFactors.map(f => language === 'hi' ? f.label_hi : f.label)
  const dataValues = sortedFactors.map(f => f.points)
  const colors = sortedFactors.map(f =>
    f.is_positive ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
  )
  const borderColors = sortedFactors.map(f =>
    f.is_positive ? '#10B981' : '#EF4444'
  )

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Score Impact (points)',
        data: dataValues,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const factor = sortedFactors[ctx.dataIndex]
            const prefix = factor.is_positive ? '+' : ''
            return `${prefix}${factor.points} pts — ${language === 'hi' ? factor.description_hi : factor.description}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#F8FAFC', font: { size: 12 } },
      },
    },
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'hi' ? 'स्कोर कारक विश्लेषण' : 'Score Factor Breakdown'}
      </h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      {/* Top contributors summary */}
      <div className="mt-4 space-y-2">
        {sortedFactors.map((factor) => (
          <div key={factor.factor} className="flex items-center gap-2 text-sm">
            <span className={factor.is_positive ? 'text-green-400' : 'text-red-400'}>
              {factor.is_positive ? '✔' : '✖'}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              {language === 'hi' ? factor.label_hi : factor.label}:
            </span>
            <span className={`font-medium ${factor.is_positive ? 'text-green-400' : 'text-red-400'}`}>
              {factor.is_positive ? '+' : ''}{factor.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

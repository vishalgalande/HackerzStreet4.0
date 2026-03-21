import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApplications, updateApplicationStatus } from './loanApi';

export default function LenderDashboard() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const handleStatusUpdate = (id, status) => {
    const updated = updateApplicationStatus(id, status);
    setApplications(updated);
    setSelectedApp(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-[var(--color-gold)] bg-[var(--color-gold)]/10 border-[var(--color-gold)]/20';
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-gradient mb-2">Lender Dashboard</h1>
          <p className="text-[var(--color-text-secondary)]">Review and manage loan applications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedApp(app)}
              className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
                selectedApp?.id === app.id
                  ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,168,67,0.15)] bg-[rgba(212,168,67,0.05)]'
                  : 'hover:border-[rgba(255,255,255,0.1)]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">{app.applicantName}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{app.id}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border border-current ${getStatusColor(app.status)} capitalize`}>
                  {app.status}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <span className="text-[var(--color-text-secondary)] capitalize">{app.type} Data</span>
                <span className="font-medium text-[var(--color-gold)]">${app.requestedAmount?.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
          {applications.length === 0 && (
            <div className="text-center text-[var(--color-text-secondary)] py-8">
              No applications found.
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                key={selectedApp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-8"
              >
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                  <div>
                    <h2 className="text-2xl font-light text-[var(--color-text-primary)] mb-1">{selectedApp.applicantName}</h2>
                    <p className="text-[var(--color-text-secondary)] flex gap-4">
                      <span>{selectedApp.id}</span>
                      <span>Applied: {new Date(selectedApp.dateApplied).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Requested Amount</p>
                    <p className="text-3xl font-light text-[var(--color-gold)]">${selectedApp.requestedAmount?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  {selectedApp.type === 'traditional' ? (
                    <>
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Credit Score</p>
                        <p className={`text-xl font-medium ${selectedApp.creditScore >= 700 ? 'text-green-400' : 'text-yellow-400'}`}>{selectedApp.creditScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Annual Salary</p>
                        <p className="text-xl">${selectedApp.salary?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Due / Paid Loans</p>
                        <p className="text-xl">
                          <span className="text-red-400">${selectedApp.dueLoans?.toLocaleString()}</span> / <span className="text-green-400">${selectedApp.paidLoans?.toLocaleString()}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Properties Value</p>
                        <p className="text-xl">${selectedApp.propertiesValue?.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-2">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Alternative Evaluation Focus</p>
                        <div className="flex items-center gap-2 mb-4">
                           <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></span>
                           <span>UPI Transaction History & Lifestyle</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">UPI Monthly Avg (eqv)</p>
                        <p className="text-xl text-green-400">${selectedApp.upiMonthlyAvg?.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">Daily Lifestyle Insights</p>
                        <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] leading-relaxed">
                          {selectedApp.lifestyle}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                      className="flex-1 py-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      Approve Loan
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                      className="flex-1 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
                {selectedApp.status !== 'pending' && (
                  <div className={`p-4 rounded-lg text-center ${getStatusColor(selectedApp.status)}`}>
                    This application has been <strong>{selectedApp.status}</strong>.
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] p-12 glass-panel border-dashed border-[rgba(255,255,255,0.1)]">
                <div className="text-center">
                  <div className="text-4xl mb-4 opacity-50">🏦</div>
                  <p>Select an application to review details</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitApplication } from './loanApi';

export default function LoanApply() {
  const [formType, setFormType] = useState('traditional');
  const [submitted, setSubmitted] = useState(false);
  
  // Traditional State
  const [name, setName] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [salary, setSalary] = useState('');
  const [dueLoans, setDueLoans] = useState('');
  const [paidLoans, setPaidLoans] = useState('');
  const [propertiesValue, setPropertiesValue] = useState('');
  const [requestedAmountTrad, setRequestedAmountTrad] = useState('');

  // Alternative State
  const [upiMonthlyAvg, setUpiMonthlyAvg] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [requestedAmountAlt, setRequestedAmountAlt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formType === 'traditional') {
      submitApplication({
        type: 'traditional',
        applicantName: name,
        creditScore: Number(creditScore),
        salary: Number(salary),
        dueLoans: Number(dueLoans),
        paidLoans: Number(paidLoans),
        propertiesValue: Number(propertiesValue),
        requestedAmount: Number(requestedAmountTrad),
      });
    } else {
      submitApplication({
        type: 'alternative',
        applicantName: name,
        upiMonthlyAvg: Number(upiMonthlyAvg),
        lifestyle,
        requestedAmount: Number(requestedAmountAlt),
      });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setCreditScore('');
      setSalary('');
      setDueLoans('');
      setPaidLoans('');
      setPropertiesValue('');
      setRequestedAmountTrad('');
      setUpiMonthlyAvg('');
      setLifestyle('');
      setRequestedAmountAlt('');
    }, 4000);
  };

  const inputClasses = "w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[rgba(255,255,255,0.05)] text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none transition-colors duration-300";
  const labelClasses = "block text-sm font-medium text-[var(--color-text-secondary)] mb-1";

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gradient mb-3">Apply for a FinFix Loan</h1>
          <p className="text-[var(--color-text-secondary)]">
            A smarter way to borrow. We evaluate your true potential, not just your credit score.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(212,168,67,0.1)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-gold)]">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-light mb-2 text-[var(--color-text-primary)]">Application Submitted</h2>
            <p className="text-[var(--color-text-secondary)]">Your application is now under review by our lenders.</p>
          </motion.div>
        ) : (
          <>
            <div className="flex bg-[rgba(0,0,0,0.2)] p-1 rounded-xl mb-8">
              <button
                className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-300 ${formType === 'traditional' ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-gold)] shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                onClick={() => setFormType('traditional')}
              >
                Traditional Application
              </button>
              <button
                className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-300 ${formType === 'alternative' ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-gold)] shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                onClick={() => setFormType('alternative')}
              >
                Alternative Data (No Credit)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={formType}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} placeholder="John Doe" />
                    </div>

                    {formType === 'traditional' ? (
                      <>
                        <div>
                          <label className={labelClasses}>Credit Score</label>
                          <input type="number" value={creditScore} onChange={e => setCreditScore(e.target.value)} required className={inputClasses} placeholder="e.g. 720" />
                        </div>
                        <div>
                          <label className={labelClasses}>Annual Salary ($)</label>
                          <input type="number" value={salary} onChange={e => setSalary(e.target.value)} required className={inputClasses} placeholder="85000" />
                        </div>
                        <div>
                          <label className={labelClasses}>Total Due Loans ($)</label>
                          <input type="number" value={dueLoans} onChange={e => setDueLoans(e.target.value)} required className={inputClasses} placeholder="12000" />
                        </div>
                        <div>
                          <label className={labelClasses}>Total Paid Loans ($)</label>
                          <input type="number" value={paidLoans} onChange={e => setPaidLoans(e.target.value)} required className={inputClasses} placeholder="45000" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Real Estate / Properties Value ($)</label>
                          <input type="number" value={propertiesValue} onChange={e => setPropertiesValue(e.target.value)} required className={inputClasses} placeholder="350000" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Requested Loan Amount ($)</label>
                          <input type="number" value={requestedAmountTrad} onChange={e => setRequestedAmountTrad(e.target.value)} required className={inputClasses} placeholder="50000" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Monthly Average UPI Inflow/Outflow ($ eqv.)</label>
                          <input type="number" value={upiMonthlyAvg} onChange={e => setUpiMonthlyAvg(e.target.value)} required className={inputClasses} placeholder="3000" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Daily Lifestyle & Expenses</label>
                          <textarea 
                            value={lifestyle} 
                            onChange={e => setLifestyle(e.target.value)} 
                            required 
                            className={`${inputClasses} h-24 resize-none`} 
                            placeholder="e.g. Retail worker, no dependents, $800 rent, daily grocery expenses ~$15" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Requested Loan Amount ($)</label>
                          <input type="number" value={requestedAmountAlt} onChange={e => setRequestedAmountAlt(e.target.value)} required className={inputClasses} placeholder="5000" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      className="brand-button px-8 py-3 w-full md:w-auto"
                    >
                      Submit Application
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

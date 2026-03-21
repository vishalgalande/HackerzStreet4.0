// Mock API for Loan Applications using localStorage
const STORAGE_KEY = 'finfix_loan_applications';

// Initialize with some mock data if empty
const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const mockData = [
      {
        id: 'LA-1001',
        type: 'traditional',
        applicantName: 'Aiden Pearce',
        creditScore: 720,
        salary: 85000,
        dueLoans: 12000,
        paidLoans: 45000,
        propertiesValue: 350000,
        requestedAmount: 50000,
        status: 'pending',
        dateApplied: new Date(Date.now() - 86400000 * 2).toISOString(),
        riskDetail: 'Low DTI, good history',
      },
      {
        id: 'LA-1002',
        type: 'alternative',
        applicantName: 'Sarah Connor',
        upiMonthlyAvg: 3000,
        lifestyle: 'Contract worker, no dependents, $800 rent',
        requestedAmount: 5000,
        status: 'pending',
        dateApplied: new Date(Date.now() - 86400000).toISOString(),
        riskDetail: 'Consistent UPI inflow, moderate rent constraint',
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
  }
};

export const getApplications = () => {
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const submitApplication = (applicationData) => {
  const applications = getApplications();
  const newApp = {
    ...applicationData,
    id: `LA-${1000 + applications.length + 1}`,
    status: 'pending',
    dateApplied: new Date().toISOString(),
  };
  applications.unshift(newApp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  return newApp;
};

export const updateApplicationStatus = (id, newStatus) => {
  const applications = getApplications();
  const updated = applications.map(app => 
    app.id === id ? { ...app, status: newStatus } : app
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

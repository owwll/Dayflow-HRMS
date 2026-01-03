import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { PayrollData, ApiResponse, Payslip, SalaryInfo } from '../types';

export const payrollService = {
    /**
     * Get payroll/salary information for a user
     */
    getPayroll: async (userId: string): Promise<PayrollData> => {
        const response = await api.get<ApiResponse<SalaryInfo>>(API_ENDPOINTS.SALARY_INFO(userId));
        const salaryInfo = response.data.data!;
        
        // Map backend SalaryInfo to frontend PayrollData format
        const payrollData: PayrollData = {
            summary: {
                grossSalary: salaryInfo.totals.grossSalary,
                totalDeductions: salaryInfo.totals.totalDeductions,
                netSalary: salaryInfo.totals.netSalary,
            },
            salaryComponents: [
                // Map components (earnings) with type 'EARNING'
                ...salaryInfo.components.map(comp => ({
                    ...comp,
                    type: 'EARNING',
                })),
                // Map deductions with type 'DEDUCTION'
                ...salaryInfo.deductions.map(ded => ({
                    ...ded,
                    type: 'DEDUCTION',
                })),
            ],
        };
        
        return payrollData;
    },

    /**
     * Generate and download payslip PDF
     */
    downloadPayslip: async (userId: string, month: string): Promise<void> => {
        // Extract year and month from YYYY-MM format
        const [year, monthNum] = month.split('-');
        
        const response = await api.post<ApiResponse<Payslip>>(
            API_ENDPOINTS.GENERATE_PAYSLIP(userId),
            {},
            {
                params: { month: monthNum, year },
            }
        );

        const payslip = response.data.data;
        if (payslip?.pdfUrl) {
            // Open PDF in new tab or download
            window.open(payslip.pdfUrl, '_blank');
        } else {
            throw new Error('Payslip PDF URL not available');
        }
    },
};

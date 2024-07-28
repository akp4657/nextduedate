"use strict";
class PayDateCalculator {
    /**
    * This method determines the first available due date following the funding of a
    loan.
    * The paydate will be at least 10 days in the future from the fundDay. The
    * due date will fall on a day that is a pay date based on their pay date model
    * specified by 'paySpan' unless the date must be adjusted forward to miss a
    * weekend or backward to miss a holiday
    *
    *
    * @param fundDay: Date - The day the loan was funded.
    * @param holidays: Date[] - An array of dates containing holidays
    * @param paySpan: - A string representing the frequency at which the customer is
    paid. (One these values: weekly, bi-weekly, monthly)
    * @param payDay: payDay - A date containing one of the customers paydays
    * @param hasDirectDeposit: boolean - A boolean determining whether or not the
    customer receives their paycheck via direct deposit.
    */
    calculateDueDate(fundDay, holidays, paySpan, payDay, hasDirectDeposit) {
        let dueDate = payDay; // We start with the 1st Pay Date after Fund Day
        let returnedDueDate = false;
        let ddLoopBoolean = hasDirectDeposit;
        let fundDay10 = new Date(fundDay);
        fundDay10.setDate(fundDay10.getDate() + 10);
        do {
            if (ddLoopBoolean == false) {
                dueDate = new Date(dueDate.setDate(dueDate.getDate() + 1));
                ddLoopBoolean = true; // Stop this calculation for the next loop iteration.
            }
            // Loop type is default forward by the time the weekend check is being made.
            if (dueDate.getDay() == 0 || dueDate.getDay() == 6)
                dueDate.getDay() == 0 ? dueDate = new Date(dueDate.setDate(dueDate.getDate() + 1)) : dueDate = new Date(dueDate.setDate(dueDate.getDate() + 2));
            // So, the first problem I encountered with dates in TypeScript. holidays.include()
            // did not seem to match the dates as expected. So, using the some() array method to
            // match the dates with getTime(). getTime() is the most precise date function and this
            // seems to do the job.
            if (holidays.some(holiday => holiday.getTime() === dueDate.getTime()))
                dueDate = new Date(dueDate.setDate(dueDate.getDate() - 1));
            if (dueDate < fundDay10) {
                switch (paySpan) {
                    case 'weekly':
                        // Bigger date ranges on setDate() causes issues with time/timezones (local vs UTC).
                        // So, this is more precise
                        payDay = new Date(payDay.getFullYear(), payDay.getMonth(), payDay.getDate() + 7);
                        break;
                    case 'bi-weekly':
                        payDay = new Date(payDay.getFullYear(), payDay.getMonth(), payDay.getDate() + 14);
                        break;
                    case 'monthly':
                        payDay = new Date(payDay.getFullYear(), payDay.getMonth(), payDay.getDate() + 30);
                        break;
                }
                ddLoopBoolean = hasDirectDeposit;
                dueDate = payDay;
            }
            else
                returnedDueDate = true;
        } while (!returnedDueDate);
        return dueDate;
    }
}
// Instance of the calculator
const calculator = new PayDateCalculator();
// Test parameters
const fundDay = new Date('2024-07-01');
const holidays = [new Date('2025-01-01'), new Date('2024-10-31'), new Date('2024-07-09')];
const paySpan = 'monthly';
const payDay = new Date('2024-07-05');
const hasDirectDeposit = false;
// Use the calculator
const dueDate = calculator.calculateDueDate(fundDay, holidays, paySpan, payDay, hasDirectDeposit);
console.log(`Due Date:`);
console.log(dueDate);

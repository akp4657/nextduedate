"use strict";
class PayDateCalculator {
    calculateDueDate(fundDay, holidays, paySpan, payDay, hasDirectDeposit) {
        let loopType = PayDateCalculator.LOOP_FORWARD;
        let dueDate = payDay; // We start with the 1st Pay Date after Fund Day
        let returnedDueDate = false;
        let fundDay10 = new Date(fundDay);
        fundDay10.setDate(fundDay10.getDate() + 10);
        // Initial call to check for if the inital due date is a weekend or a holiday
        dueDate = this.adjustDueDate(dueDate, 0, loopType);
        do {
            loopType = PayDateCalculator.LOOP_FORWARD; // Reset loop type in case we landed on a weekend.
            if (!hasDirectDeposit)
                dueDate = this.adjustDueDate(dueDate, 1, loopType);
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
                        payDay = new Date(payDay.setMonth(payDay.getMonth() + 1)); // More accuracy with months
                        break;
                }
                // Reset variables when we need to restart at the beginning of the flowchart
                dueDate = payDay;
            }
            else
                returnedDueDate = true;
        } while (!returnedDueDate);
        return dueDate;
    }
    // Recursive helper function to do the weekend check as well as to follow DRY.
    // I chose a recursive solution for readability purposes.
    adjustDueDate(dueDate, daysToAdjust, loopType) {
        dueDate = new Date(dueDate.setDate(dueDate.getDate() + (daysToAdjust * loopType)));
        if (dueDate.getUTCDay() == 0 || dueDate.getUTCDay() == 6)
            return this.adjustDueDate(dueDate, 1, loopType); // Weekend check.
        // The first problem I encountered with dates in TypeScript. holidays.include()
        // did not seem to match the dates as expected, likely due to timezones vs UTC. So, using the some() array method to
        // match the dates in the array directly against dueDate with getTime() to be timezone agnostic.
        // After considering edge cases, there are possibilities for consecutive holidays. Putting the holiday check in the recursive function
        // will save an iteration of the loop
        if (holidays.some(holiday => holiday.getTime() === dueDate.getTime()))
            return this.adjustDueDate(dueDate, 1, PayDateCalculator.LOOP_REVERSE); // Holiday check
        else
            return dueDate;
    }
}
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
// Static (const) variables at class scope to use in the helper function
PayDateCalculator.LOOP_FORWARD = 1;
PayDateCalculator.LOOP_REVERSE = -1;
// Instance of the calculator
const calculator = new PayDateCalculator();
// Test parameters | Expected result is August 12th 2024
const fundDay = new Date('2024-07-30');
const holidays = [new Date('2025-01-01'), new Date('2024-10-31'), new Date('2024-07-29'), new Date('2024-12-24'), new Date('2024-12-25')];
const paySpan = 'weekly';
const payDay = new Date('2024-07-26');
const hasDirectDeposit = false;
// Use the calculator
const finalDueDate = calculator.calculateDueDate(fundDay, holidays, paySpan, payDay, hasDirectDeposit);
console.log(`Due Date:`);
console.log(finalDueDate);

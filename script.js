let annualLeaveEntitlement = 0;
function setPreviousStep(prevStep) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById(prevStep).style.display = 'block';
}
let usedCarryBeforeApr = false;
document.getElementById('usedCarryYesBtn').addEventListener('click', function() {
    usedCarryBeforeApr = true;
    document.getElementById('carriedUsedDiv').style.display = 'block';
    this.style.backgroundColor = '#45a049';
    document.getElementById('usedCarryNoBtn').style.backgroundColor = '#f44336';
});
document.getElementById('usedCarryNoBtn').addEventListener('click', function() {
    usedCarryBeforeApr = false;
    document.getElementById('carriedUsedDiv').style.display = 'none';
    document.getElementById('daysUsedBeforeApr').value = '';
    this.style.backgroundColor = '#d32f2f';
    document.getElementById('usedCarryYesBtn').style.backgroundColor = '#4CAF50';
});
function calculateDaysWorked() {
    const terminationDate = new Date(document.getElementById('terminationDate').value);
    const currentDate = new Date('2025-07-02'); // Current date as per 11:13 AM HKT, July 02, 2025
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    let daysWorked = Math.floor((terminationDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    if (daysWorked < 0) {
        alert("Termination date must be within the current year.");
        return;
    }
    annualLeaveEntitlement = (20 * daysWorked) / 365;
    document.getElementById('entitlementOutput').innerText = 
        `${annualLeaveEntitlement.toFixed(2)} days (20 × ${daysWorked} ÷ 365 = ${annualLeaveEntitlement.toFixed(2)})`;
    setPreviousStep('step3');
}
function calculateOutstandingLeave() {
    const annualLeaveTaken = parseFloat(document.getElementById('annualLeaveTaken').value);
    const carryForward = parseFloat(document.getElementById('carryForward').value);
    let daysUsedBeforeApr = 0;
    if (usedCarryBeforeApr) {
        daysUsedBeforeApr = parseFloat(document.getElementById('daysUsedBeforeApr').value) || 0;
    }
    const outstandingLeave = annualLeaveEntitlement - annualLeaveTaken + (carryForward - daysUsedBeforeApr);
    document.getElementById('entitlementResult').textContent = annualLeaveEntitlement.toFixed(2);
    document.getElementById('takenResult').textContent = annualLeaveTaken;
    document.getElementById('carryForwardResult').textContent = carryForward;
    document.getElementById('usedBeforeResult').textContent = usedCarryBeforeApr ? daysUsedBeforeApr : 0;
    document.getElementById('outstandingResult').textContent = outstandingLeave.toFixed(2);
    setPreviousStep('result');
}
function resetToStep1() {
    document.getElementById('terminationDate').value = '';
    document.getElementById('annualLeaveTaken').value = '';
    document.getElementById('carryForward').value = '';
    document.getElementById('daysUsedBeforeApr').value = '';
    usedCarryBeforeApr = false;
    document.getElementById('carriedUsedDiv').style.display = 'none';
    document.getElementById('usedCarryYesBtn').style.backgroundColor = '#4CAF50';
    document.getElementById('usedCarryNoBtn').style.backgroundColor = '#f44336';
    annualLeaveEntitlement = 0;
    document.getElementById('entitlementOutput').innerText = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
}
// Final Leave Payment Calculator
let paymentRowCount = 0;
const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
const types = ["Salary", "Garden Leave"];
function addPaymentRow() {
    const rowId = `row${paymentRowCount++}`;
    const row = document.createElement('div');
    row.innerHTML = `
        <select class="paymentType">
            ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select class="paymentMonth">
            ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
        <input type="number" class="workingDays" placeholder="Working Days" min="0" required style="width:120px;">
        <input type="number" class="totalWorkingDays" placeholder="Total Working Days" min="1" required style="width:150px;">
        <span class="paymentResult"></span>
        <button onclick="this.parentElement.remove()">Remove</button>
    `;
    document.getElementById('paymentRows').appendChild(row);
}
// Voluntary MPF button logic
const voluntaryYesBtn = document.getElementById('voluntaryYesBtn');
const voluntaryNoBtn = document.getElementById('voluntaryNoBtn');
let voluntaryOptIn = null; // null means no selection yet
let voluntarySelected = false;

function updateVoluntaryBtnStyles() {
  if (!voluntarySelected) {
    voluntaryYesBtn.classList.remove('selected-yes', 'selected-no');
    voluntaryNoBtn.classList.remove('selected-yes', 'selected-no');
  } else if (voluntaryOptIn === true) {
    voluntaryYesBtn.classList.add('selected-yes');
    voluntaryNoBtn.classList.remove('selected-no');
    voluntaryNoBtn.classList.remove('selected-yes');
  } else if (voluntaryOptIn === false) {
    voluntaryNoBtn.classList.add('selected-no');
    voluntaryYesBtn.classList.remove('selected-yes');
    voluntaryYesBtn.classList.remove('selected-no');
  }
}
voluntaryYesBtn.addEventListener('click', function() {
  voluntaryOptIn = true;
  voluntarySelected = true;
  updateVoluntaryBtnStyles();
});
voluntaryNoBtn.addEventListener('click', function() {
  voluntaryOptIn = false;
  voluntarySelected = true;
  updateVoluntaryBtnStyles();
});
// On load, both are blue
voluntaryOptIn = null;
voluntarySelected = false;
updateVoluntaryBtnStyles();
function calculateFinalLeavePayment() {
    const basicSalary = parseFloat(document.getElementById('basicSalary').value);
    if (isNaN(basicSalary) || basicSalary <= 0) {
        alert("Please enter a valid basic salary.");
        return;
    }
    // Use voluntaryOptIn from button state
    if (voluntaryOptIn === null) {
        alert("Please select whether the employee would like to make a voluntary MPF contribution.");
        return;
    }
    const rows = document.querySelectorAll('#paymentRows > div');
    let payments = [];
    let gardenLeaveTotal = 0;
    let mpfContributions = {};
    let paymentTableRows = '';
    rows.forEach(row => {
        const type = row.querySelector('.paymentType').value;
        const month = row.querySelector('.paymentMonth').value;
        const workingDays = parseFloat(row.querySelector('.workingDays').value);
        const totalWorkingDays = parseFloat(row.querySelector('.totalWorkingDays').value);
        if (isNaN(workingDays) || isNaN(totalWorkingDays) || totalWorkingDays <= 0) {
            alert("Please enter valid working days for all rows.");
            return;
        }
        const payment = Math.round((basicSalary * workingDays) / totalWorkingDays);
        row.querySelector('.paymentResult').textContent = `Payment: HKD ${payment.toLocaleString()}`;
        payments.push({ type, month, payment });
        if (type === "Garden Leave") gardenLeaveTotal += payment;
        paymentTableRows += `<tr>
            <td>${month} ${type}</td>
            <td>${workingDays}</td>
            <td>${totalWorkingDays}</td>
            <td>HKD ${payment.toLocaleString()}</td>
        </tr>`;
    });
    // Aggregate payments by month for MPF calculation
    let monthlyTotals = {};
    payments.forEach(p => {
        if (!monthlyTotals[p.month]) monthlyTotals[p.month] = 0;
        monthlyTotals[p.month] += p.payment;
    });
    // MPF for each month (only once per month)
    Object.keys(monthlyTotals).forEach(month => {
        // Mandatory: 5% of total monthly payment, capped at 1,500
        const mandatory = Math.min(Math.round(monthlyTotals[month] * 0.05), 1500);
        // Voluntary: 3% of basic salary if opted in, else 0
        const voluntary = voluntaryOptIn ? Math.round(basicSalary * 0.03) : 0;
        mpfContributions[month] = {
            mandatory,
            voluntary
        };
    });
    const totalPayments = payments.reduce((sum, p) => sum + p.payment, 0);
    // Calculate total MPF contributions
    const totalMPF = Object.values(mpfContributions).reduce((sum, contribution) => sum + contribution.mandatory + (voluntaryOptIn ? contribution.voluntary : 0), 0);
    const finalPayment = totalPayments - totalMPF;
    document.getElementById('finalLeaveResult').innerHTML = `
        <h3>Final Leave Payment Calculation</h3>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
            <tr><th>Type</th><th>Working Days</th><th>Total Working Days</th><th>Payment</th></tr>
            ${paymentTableRows}
        </table>
        <p><strong>Total Garden Leave:</strong> HKD ${gardenLeaveTotal.toLocaleString()}</p>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
            <tr><th>MPF Contribution</th><th>Amount</th></tr>
            ${Object.entries(mpfContributions).map(([month, contribution]) => `
                <tr><td>${month} (mandatory)</td><td>HKD ${contribution.mandatory.toLocaleString()}</td></tr>
                ${voluntaryOptIn ? `<tr><td>${month} (voluntary)</td><td>HKD ${contribution.voluntary.toLocaleString()}</td></tr>` : ''}
            `).join('')}
        </table>
        <p><strong>Final Payment:</strong> HKD ${finalPayment.toLocaleString()}</p>
    `;
    document.getElementById('finalLeaveResult').style.display = 'block';
}
// Add one row by default
addPaymentRow(); 
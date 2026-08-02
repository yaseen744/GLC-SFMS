// Turns the stored "Parent WhatsApp" number into a clickable wa.me link.
// Assumes Pakistani numbers by default (0300xxxxxxx -> 92300xxxxxxx),
// but leaves numbers that already include a country code untouched.
export function buildWhatsappLink(rawNumber, message = "") {
  if (!rawNumber) return null;

  let digits = String(rawNumber).replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("0")) {
    digits = "92" + digits.slice(1);
  } else if (!digits.startsWith("92") && digits.length <= 10) {
    digits = "92" + digits;
  }

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Generic respectful fee reminder — used from the students list (search by
// name, one click) when you just want to nudge a parent about this month's fee.
export function buildFeeReminderMessage(student) {
  const amount = new Intl.NumberFormat("en-PK").format(student.monthlyFee || 0);
  return (
    `Assalam-o-Alaikum, respected parent of ${student.name} (Class ${student.class}). ` +
    `This is a gentle reminder from Global Learning Center regarding the monthly fee of ${amount} PKR. ` +
    `Kindly arrange the payment at your earliest convenience. Thank you.`
  );
}

// Specific reminder tied to one unpaid month/year row in the fee history table.
export function buildUnpaidFeeMessage(student, feeRecord) {
  const amount = new Intl.NumberFormat("en-PK").format(feeRecord.feeAmount || 0);
  const period = `${MONTH_NAMES[feeRecord.month - 1]} ${feeRecord.year}`;
  return (
    `Assalam-o-Alaikum, respected parent of ${student.name} (Class ${student.class}). ` +
    `This is a gentle reminder from Global Learning Center that the fee of ${amount} PKR for ${period} is still pending. ` +
    `Kindly arrange the payment at your earliest convenience. Thank you for your cooperation.`
  );
}

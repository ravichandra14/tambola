/**
 * Validates a claim against ticket and called numbers.
 * All validation happens server-side to prevent cheating.
 */

/**
 * Check if at least 5 numbers on the ticket have been called.
 */
const validateEarlyFive = (ticketNumbers, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  const matched = ticketNumbers.filter((n) => calledSet.has(n));
  return matched.length >= 5;
};

/**
 * Check if all numbers in the top row (index 0) have been called.
 */
const validateTopLine = (ticketRows, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  const topRow = ticketRows[0].filter((n) => n > 0);
  return topRow.every((n) => calledSet.has(n));
};

/**
 * Check if all numbers in the middle row (index 1) have been called.
 */
const validateMiddleLine = (ticketRows, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  const middleRow = ticketRows[1].filter((n) => n > 0);
  return middleRow.every((n) => calledSet.has(n));
};

/**
 * Check if all numbers in the bottom row (index 2) have been called.
 */
const validateBottomLine = (ticketRows, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  const bottomRow = ticketRows[2].filter((n) => n > 0);
  return bottomRow.every((n) => calledSet.has(n));
};

/**
 * Check if ALL 15 numbers on the ticket have been called.
 */
const validateFullHouse = (ticketNumbers, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  return ticketNumbers.every((n) => calledSet.has(n));
};

const validateClaim = (claimType, ticket, calledNumbers) => {
  switch (claimType) {
    case 'earlyFive':
      return validateEarlyFive(ticket.numbers, calledNumbers);
    case 'topLine':
      return validateTopLine(ticket.rows, calledNumbers);
    case 'middleLine':
      return validateMiddleLine(ticket.rows, calledNumbers);
    case 'bottomLine':
      return validateBottomLine(ticket.rows, calledNumbers);
    case 'fullHouse':
      return validateFullHouse(ticket.numbers, calledNumbers);
    default:
      return false;
  }
};

module.exports = { validateClaim };

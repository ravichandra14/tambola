/**
 * Generates a valid standard Tambola ticket.
 * Rules:
 *  - 3 rows x 9 columns
 *  - 15 numbers total (exactly 5 per row)
 *  - Column bands: col0 = 1-9, col1 = 10-19, ... col8 = 80-90
 *  - Each column has 1-3 numbers across the 3 rows
 *  - No duplicate numbers on the ticket
 */
const generateTicket = () => {
  // Column ranges
  const colRanges = [
    [1, 9],
    [10, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
    [80, 90],
  ];

  // We'll build the ticket column by column
  // Each column can have 1, 2, or 3 numbers placed in the 3 rows
  // Total numbers = 15 across 9 columns means average ~1.67 per col
  // Constraint: exactly 5 per row

  const grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Decide how many numbers go in each column
  // We need total = 15 across 9 columns
  // Each column: min 1, max 3
  // Standard distribution: some cols get 1, some get 2, some get 3
  // Typical: 6 cols with 1 num, 2 cols with 2 nums, 1 col with 3 nums = 6+4+3 = 13 NO
  // Standard: need exactly 15 from 9 cols:
  //   E.g., 6 cols with 2 nums + 3 cols with 1 num = 12+3=15 YES (variant)
  //   Or: 3 cols with 1, 5 cols with 2, 1 col with 3 = 3+10+3=16 NO
  //   Actually standard is: each col has exactly 1 or 2 or 3 numbers, total=15
  //   One valid distribution: 6 cols have 2 numbers, 3 cols have 1 number = 15 ✓

  let colCounts = [];
  // Random valid distribution summing to 15 with each value in [1,3]
  // Approach: start with all 1s (sum=9), need 6 more, distribute randomly
  colCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  let remaining = 6;
  while (remaining > 0) {
    const col = Math.floor(Math.random() * 9);
    if (colCounts[col] < 3) {
      colCounts[col]++;
      remaining--;
    }
  }

  // For each column, pick which rows get numbers
  const rowCounts = [0, 0, 0]; // how many numbers in each row so far

  for (let col = 0; col < 9; col++) {
    const count = colCounts[col];
    const [min, max] = colRanges[col];
    const nums = pickNumbers(min, max, count);

    // Pick which rows to place them in (need to respect rowCounts <= 5 each)
    const availableRows = [0, 1, 2].filter((r) => rowCounts[r] < 5);
    const chosenRows = sample(availableRows, count);

    // Sort the numbers and rows so smaller number goes to higher row (aesthetic)
    const sortedNums = [...nums].sort((a, b) => a - b);
    const sortedRows = [...chosenRows].sort((a, b) => a - b);

    sortedRows.forEach((row, i) => {
      grid[row][col] = sortedNums[i];
      rowCounts[row]++;
    });
  }

  // Ensure each row has exactly 5 numbers (redistribute if needed due to random failures)
  // This brute-force approach retries if the ticket isn't valid
  const flat = grid.flat().filter((n) => n > 0);
  const rowSums = grid.map((row) => row.filter((n) => n > 0).length);

  if (rowSums[0] !== 5 || rowSums[1] !== 5 || rowSums[2] !== 5) {
    return generateTicket(); // retry
  }

  return {
    rows: grid,
    numbers: flat,
  };
};

const pickNumbers = (min, max, count) => {
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);
  return sample(pool, count);
};

const sample = (arr, n) => {
  const shuffled = [...arr];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, n);
};

module.exports = { generateTicket };

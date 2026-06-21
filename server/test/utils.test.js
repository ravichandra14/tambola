const test = require('node:test');
const assert = require('node:assert/strict');
const { generateTicket } = require('../src/utils/ticketGenerator');
const { validateClaim } = require('../src/utils/claimValidator');

test('ticket generator always produces valid Tambola tickets', () => {
  for (let index = 0; index < 1000; index += 1) {
    const ticket = generateTicket();
    assert.equal(ticket.rows.length, 3);
    assert.equal(ticket.numbers.length, 15);
    assert.equal(new Set(ticket.numbers).size, 15);
    ticket.rows.forEach((row) => assert.equal(row.filter(Boolean).length, 5));
  }
});

test('claim validation uses called numbers only', () => {
  const ticket = {
    rows: [
      [1, 0, 20, 0, 40, 0, 60, 0, 80],
      [0, 10, 0, 30, 0, 50, 0, 70, 90],
      [2, 0, 21, 0, 41, 0, 61, 0, 81],
    ],
    numbers: [1, 20, 40, 60, 80, 10, 30, 50, 70, 90, 2, 21, 41, 61, 81],
  };
  assert.equal(validateClaim('topLine', ticket, [1, 20, 40, 60, 80]), true);
  assert.equal(validateClaim('fullHouse', ticket, [1, 20, 40, 60, 80]), false);
  assert.equal(validateClaim('unknown', ticket, ticket.numbers), false);
});

const pool = require('../db');

function buildDocumentNumber(prefix, date, sequence) {
  const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
  const paddedSequence = String(sequence).padStart(5, '0');
  return `${prefix}-${yymmdd}-${paddedSequence}`;
}

async function getNextSequence(client, key) {
  const result = await client.query(
    `
      UPDATE document_sequences
      SET last_value = last_value + 1,
          updated_at = NOW()
      WHERE key = $1
      RETURNING last_value
    `,
    [key]
  );

  if (result.rowCount === 0) {
    throw new Error(`Sequence key not found: ${key}`);
  }

  return Number(result.rows[0].last_value);
}

async function createDocumentNumber(key, prefix, client = pool) {
  const sequence = await getNextSequence(client, key);
  return buildDocumentNumber(prefix, new Date(), sequence);
}

module.exports = {
  createDocumentNumber,
  buildDocumentNumber,
};

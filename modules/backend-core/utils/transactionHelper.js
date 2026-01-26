import { getSequelize } from "../config/database.js";

/**
 * Execute a function within a database transaction
 * @param {Function} operation - Async function that takes transaction as parameter
 * @returns {Promise<any>} Result of the operation
 */
export const withTransaction = async (operation) => {
  const sequelize = getSequelize();
  const transaction = await sequelize.transaction();

  try {
    const result = await operation(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Execute multiple operations in a single transaction
 * @param {Function[]} operations - Array of async functions that take transaction as parameter
 * @returns {Promise<any[]>} Array of results from each operation
 */
export const withTransactionMultiple = async (operations) => {
  const sequelize = getSequelize();
  const transaction = await sequelize.transaction();

  try {
    const results = [];
    for (const operation of operations) {
      const result = await operation(transaction);
      results.push(result);
    }
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

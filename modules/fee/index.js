// Fee Module - Main exports

// Controllers
export {
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
  recordPayment,
  getPaymentHistory,
  generateFeeReport,
} from "./controllers/feeController.js";

// Routes
export { default as feeRoutes } from "./routes/feeRoutes.js";

// Models
export { default as FeeStructure } from "./models/FeeStructure.js";
export { default as Payment } from "./models/Payment.js";

// Cloudflare Pages Functions entry point
// This file ensures proper ES2020+ compilation for Cloudflare Pages Functions

// Re-export all API functions
export { onRequest as stockData } from './api/stock-data.js';
export { onRequest as generateReport } from './api/generate-report.js';

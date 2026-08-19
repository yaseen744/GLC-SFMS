// Vercel serverless entry point. Vercel detects any file under /api and runs
// it as a serverless function; exporting the Express app directly lets
// Vercel's Node runtime handle each request without a persistent app.listen().
import app from "../app.js";

export default app;

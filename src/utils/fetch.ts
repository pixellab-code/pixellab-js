// Polyfill for fetch in Node.js environments
import nodeFetch, { Response } from "node-fetch";

// Use node-fetch for Node 16 compatibility
export const fetch = nodeFetch;
export { Response };

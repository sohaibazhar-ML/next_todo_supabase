// Admin Components
export * as Admin from "./admin";

// Website Components
export * as Website from "./website";

// Explicit re-exports for components with naming collisions (Legacy support)
export { DocumentList as AdminDocumentList } from "./admin";
export { DocumentList as WebsiteDocumentList } from "./website";

// Default resolution for collision (matches previous behavior)
export { DocumentList } from "./admin";

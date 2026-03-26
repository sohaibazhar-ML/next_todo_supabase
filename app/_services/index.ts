// Admin-only services
export { adminStatsService } from "./admin";
export { adminSettingsService } from "./admin";
export { reportService } from "./admin";
export { userService } from "./admin";
export { downloadService } from "./admin";
export { documentService } from "./admin";

// Website-only services
export { profileService } from "./website";

// Shared services (use domain-specific imports via @/services/admin/* or @/services/website/*)
export { authService } from "./admin";
export { api, apiClient } from "./admin";

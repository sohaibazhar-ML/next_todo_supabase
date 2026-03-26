// Domain-specific hooks are imported via @/admin/hooks or @/website/hooks aliases.
// This barrel serves as a convenience re-export for admin-only and website-only hooks.
// Shared hooks (useAuth, useDebounce, etc.) exist in both domains and should be
// imported from the domain-specific path to avoid ambiguity.

// Admin-only hooks
export { useAdminProfile } from "./admin";
export { useAdminStats } from "./admin";
export { useDocuments } from "./admin";
export { useDownloadLogs } from "./admin";
export { useReports } from "./admin";
export { useUsers } from "./admin";

// Website-only hooks
export { useProfile } from "./website";
export { useProfileForm } from "./website";
export { useSocialAuth } from "./website";
export { useDocumentDownload } from "./website";

# QA Release Notes & Testing Guide
## Version: April 6, 2026

This document outlines the specific features, rules, and validators that the QA team must test. Please run regression testing on the following Admin and User fronts.

## 1. User Application (Client Side)

Please test the following authentication flows and ensure all validation rules trigger correctly.

### Registration Form
Test the signup flow thoroughly against the strict validation schema outlined below. Try to bypass these rules to ensure the frontend catches the errors.

**Password Requirements:**
*   Minimum 8 characters long
*   At least 1 uppercase letter (`A-Z`)
*   At least 1 number (`0-9`)
*   At least 1 special character (e.g., `!@#$%^&*`)

**Required Fields:**
*   **Email:** Must be a valid email format (serves as the unique login identifier).
*   **Password:** Must match the criteria above.
*   **First Name & Last Name:** Minimum 2 characters each.
*   **Gender:** Must be selected.
*   **Current Address:** Minimum 5 characters.
*   **Country:** Must be selected.
*   **New Address in Switzerland:** Minimum 5 characters.
*   **Total Persons:** Must be 0 or more.
*   **Number of Adults:** Must be 0 or more.
*   **Pets:** Must explicitly select 'Yes' or 'No'.

**Optional Fields:**
*   **Number of Children:** (If provided, must be 0 or more).
*   **Which Pets:** (Only required/expected if "Pets" is "Yes", but formally optional).
*   **Phone Number**
*   **Preferred Call Time**
*   **Marketing Consent** (Checkbox)

### Authentication Flows
*   **Login:** Test standard login with a verified account.
*   **Forgot Password:** Enter email to receive a reset link. *(Note: Supabase limits this to 3 emails per hour. Do not rapid-fire test this with the same email).*
*   **Reset Password:** Follow the link from the email and set a new password. Verify it enforces the password strength rules defined above.
*   **Email Deliverability Note:** If you do not receive the confirmation, reset, or other transactional emails in your inbox, **please check your spam/junk folder** as our automated system emails may occasionally be filtered.
*   **Logout:** Ensure session is destroyed and user is redirected to the home/login page.

### Role-Based Access Control (RBAC)
We have three distinct roles in the system. Please verify that the system correctly enforces restrictions for each role:
1.  **User (`user`)**:
    *   Should only be able to access the standard user-end dashboard after login.
    *   Must be completely blocked from accessing *any* `/admin` routes.
2.  **Subadmin (`subadmin`)**:
    *   Has access to the Admin Portal.
    *   **Read-Only:** Ensure they can *view* all details, dashboards, and histories.
    *   **Blocked Actions:** Verify they *cannot* edit, create, upload, or delete anything across any of the admin pages.
3.  **Admin (`admin`)**:
    *   Has full authority.
    *   Verify they can perform all CRUD (Create, Read, Update, Delete) actions across the Admin Portal as described below.

---

## 2. Admin Portal

Log in as an Administrator and test the following pages and their respective capabilities:

### Dashboard
*   **Stats:** Verify that the high-level statistics cards show correct numbers (Total users, total documents, downloads, etc.).

### Users Management
*   **Show Details:** View individual user profile details.
*   **Edit Details:** Ensure you can modify user data and save it.
*   **Delete User:** Test single deletion of a user.
*   **Bulk Delete:** Select multiple users and delete them simultaneously.
*   **Export:** Export the user list to CSV/Excel.
*   **Filters:** Test sorting and filtering parameters (by role, country, etc.).
*   **Raw Search:** Type a specific name/email into the search bar and verify results update correctly.

### Manage Documents
*   **Upload:** Test uploading a new document.
*   **Show & Edit:** View document details and attempt editing metadata/content.
*   **Delete & Bulk Delete:** Test deleting a single document, and selecting multiple for bulk deletion.
*   **Export:** Test exporting the documents table data.
*   **Filters & Raw Search:** Verify search and category filtering work correctly on the documents table.

### Download History
*   **Show Downloads:** Verify that the log correctly shows which user downloaded which document.
*   **Delete & Bulk Delete:** Test clearing log entries singly and in bulk.
*   **Filter & Search:** Ensure you can search for a specific user's download history.
*   **Export:** Export the history log.

### Monthly Reports
*   **Show Logs:** Verify the monthly download logs render accurately.
*   **Filters:** Ensure you can filter logs by month/year.
*   **Export:** Test the export format for reports.

### Settings
*   **Admin Details:** For now, verify that the page simply displays the current administrator's profile information accurately. No editing capability is required for this sprint on this page.

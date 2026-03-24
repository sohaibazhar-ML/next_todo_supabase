"use client";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { DocumentList, DocumentEdit, DocumentShow, DocumentCreate } from "./resources/Documents";
import { UserList, UserEdit, UserShow } from "./resources/Users";
import Dashboard from "./Dashboard";
import StatisticsPage from "./Statistics";
import SettingsPage from "./Settings";
import ReportsPage from "./resources/Reports";

const AdminApp = () => (
    <Admin 
        dataProvider={dataProvider} 
        authProvider={authProvider}
        dashboard={Dashboard}
    >
        {permissions => [
            // Profiles: Full access for admin, show-only for subadmin
            <Resource
                name="profiles"
                key="profiles"
                options={{ label: 'Users' }}
                icon={PeopleIcon}
                list={UserList}
                edit={permissions === 'admin' ? UserEdit : undefined}
                show={UserShow}
            />,

            // Manage Documents: Full access (bulk/upload/etc)
            <Resource
                name="documents"
                key="manage-documents"
                options={{ label: 'Manage Documents' }}
                icon={UploadIcon}
                list={DocumentList}
                create={DocumentCreate}
                edit={DocumentEdit}
                show={DocumentShow}
            />,

            // Document History & Downloads (View Only for both)
            <Resource
                name="user_document_versions"
                key="user_document_versions"
                options={{ label: 'Recent Edits' }}
                icon={HistoryIcon}
                list={ListGuesser}
                show={ShowGuesser}
            />,
            <Resource
                name="download_logs"
                key="download_logs"
                options={{ label: 'Download History' }}
                icon={DownloadIcon}
                list={ListGuesser}
                show={ShowGuesser}
            />,

            // Reports: Monthly Activity (Uploads/Downloads)
            <Resource
                name="reports"
                key="reports"
                options={{ label: 'Monthly Reports' }}
                icon={DescriptionIcon}
                list={ReportsPage}
            />,

            // Statistics (Charts/Overview)
            <Resource
                name="stats"
                key="stats"
                options={{ label: 'System Stats' }}
                icon={AnalyticsIcon}
                list={StatisticsPage}
            />,
            
            // Administrative Sections: Admin Only
            permissions === 'admin' ? (
                <Resource
                    name="subadmin_permissions"
                    key="subadmin_permissions"
                    options={{ label: 'Subadmin Access' }}
                    icon={AdminPanelSettingsIcon}
                    list={ListGuesser}
                    edit={EditGuesser}
                    show={ShowGuesser}
                />
            ) : null,
            permissions === 'admin' ? (
                <Resource
                    name="settings"
                    key="settings"
                    options={{ label: 'Settings' }}
                    icon={SettingsIcon}
                    list={SettingsPage}
                />
            ) : null,
        ]}
    </Admin>
);

export default AdminApp;

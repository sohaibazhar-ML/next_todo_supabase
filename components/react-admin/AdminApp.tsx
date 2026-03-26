"use client";
import { Admin, Resource, ListGuesser, ShowGuesser } from "react-admin";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { DocumentList, DocumentEdit, DocumentShow, DocumentCreate } from "./resources/Documents";
import { UserList, UserEdit, UserShow } from "./resources/Users";
import { DownloadLogList } from "./resources/DownloadLogs";
import SettingsPage from "./Settings";
import ReportsPage from "./resources/Reports";

const AdminApp = () => (
    <Admin 
        dataProvider={dataProvider} 
        authProvider={authProvider}
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
                create={permissions === 'admin' ? DocumentCreate : undefined}
                edit={permissions === 'admin' ? DocumentEdit : undefined}
                show={DocumentShow}
            />,

            // Download History (View Only)
            <Resource
                name="download_logs"
                key="download_logs"
                options={{ label: 'Download History' }}
                icon={DownloadIcon}
                list={DownloadLogList}
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
            
            // Administrative Sections: Admin Only
            permissions === 'admin' ? [
                <Resource
                    name="settings"
                    key="settings"
                    options={{ label: 'Settings' }}
                    icon={SettingsIcon}
                    list={SettingsPage}
                />
            ] : null,
        ]}
    </Admin>
);

export default AdminApp;

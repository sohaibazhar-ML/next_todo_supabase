"use client";
import { Admin, Resource, ShowGuesser } from "react-admin";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { DocumentList, DocumentEdit, DocumentShow, DocumentCreate } from "@/admin/organisms";
import { UserList, UserEdit, UserShow } from "@/admin/organisms";
import { DownloadLogList } from "@/admin/organisms";
import { SettingsPage } from "@/admin/organisms";
import { ReportsPage } from "@/admin/organisms";
import { StatisticsPage } from "@/admin/organisms";
import { ChecklistList, ChecklistCreate, ChecklistEdit } from "@/admin/organisms";
import { adminTheme } from "./theme";
import { MyLayout } from "./MyLayout";

const AdminApp = () => (
    <Admin 
        dataProvider={dataProvider} 
        authProvider={authProvider}
        dashboard={StatisticsPage}
        theme={adminTheme}
        layout={MyLayout}
        darkTheme={null}
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
            
            // Checklist Management
            <Resource
                name="checklistItem"
                key="checklist"
                options={{ label: 'Checklist' }}
                icon={FactCheckIcon}
                list={ChecklistList}
                create={permissions === 'admin' ? ChecklistCreate : undefined}
                edit={permissions === 'admin' ? ChecklistEdit : undefined}
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

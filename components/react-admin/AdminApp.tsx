"use client";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from "react-admin";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";

const AdminApp = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
        <Resource
            name="profiles"
            list={ListGuesser}
            edit={EditGuesser}
            show={ShowGuesser}
            recordRepresentation={(record) =>
                `${record.first_name} ${record.last_name}`
            }
        />
        <Resource
            name="documents"
            list={ListGuesser}
            edit={EditGuesser}
            show={ShowGuesser}
            recordRepresentation="title"
        />
        <Resource
            name="download_logs"
            list={ListGuesser}
            show={ShowGuesser}
            recordRepresentation="id"
        />
        <Resource
            name="subadmin_permissions"
            list={ListGuesser}
            edit={EditGuesser}
            show={ShowGuesser}
            recordRepresentation="user_id"
        />
    </Admin>
);

export default AdminApp;

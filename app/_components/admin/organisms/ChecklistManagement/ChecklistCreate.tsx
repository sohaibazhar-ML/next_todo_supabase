import React from 'react';
import { Create, SimpleForm, TextInput, BooleanInput, SelectInput } from 'react-admin';

const PHASES = [
    { id: 'Vor Umzug', name: 'Vor Umzug' },
    { id: 'Während Umzug', name: 'Während Umzug' },
    { id: 'Nach Umzug', name: 'Nach Umzug' },
];

export const ChecklistCreate = () => (
    <Create>
        <SimpleForm>
            <SelectInput source="phase" choices={PHASES} fullWidth />
            <TextInput source="category" required fullWidth />
            <TextInput source="title" label="Task" required fullWidth />
            <TextInput source="description" multiline fullWidth />
            <BooleanInput source="is_mandatory" label="Mandatory" defaultValue={true} />
        </SimpleForm>
    </Create>
);

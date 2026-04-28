import { Edit, SimpleForm, TextInput, BooleanInput, SelectInput, TopToolbar, ListButton } from 'react-admin';
import { DynamicCategoryInput } from '../../atoms/DynamicCategoryInput';

const PHASES = [
    { id: 'Vor Umzug', name: 'Vor Umzug' },
    { id: 'Während Umzug', name: 'Während Umzug' },
    { id: 'Nach Umzug', name: 'Nach Umzug' },
];

const ChecklistEditActions = () => (
    <TopToolbar>
        <ListButton label="Back to Checklist" />
    </TopToolbar>
);

export const ChecklistEdit = () => (
    <Edit actions={<ChecklistEditActions />}>
        <SimpleForm>
            <SelectInput source="phase" choices={PHASES} fullWidth />
            <DynamicCategoryInput 
                source="category" 
                apiUrl="/api/admin/checklist/filter-options" 
                required 
            />
            <TextInput source="title" label="Task" required fullWidth />
            <TextInput source="description" multiline fullWidth />
            <BooleanInput source="is_mandatory" label="Mandatory" />
        </SimpleForm>
    </Edit>
);

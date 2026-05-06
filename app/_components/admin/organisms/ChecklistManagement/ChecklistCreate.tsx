import { Create, SimpleForm, TextInput, BooleanInput, SelectInput } from 'react-admin';
import { DynamicCategoryInput } from '../../atoms/DynamicCategoryInput';

const PHASES = [
    { id: 'Vor Umzug', name: 'Vor Umzug' },
    { id: 'Während Umzug', name: 'Während Umzug' },
    { id: 'Nach Umzug', name: 'Nach Umzug' },
];

export const ChecklistCreate = () => (
    <Create>
        <SimpleForm>
            <SelectInput source="phase" choices={PHASES} fullWidth />
            <DynamicCategoryInput 
                source="category" 
                apiUrl="/api/admin/checklist/filter-options" 
                required 
            />
            <TextInput source="title" label="Task" required fullWidth />
            <TextInput source="description" multiline fullWidth />
            <SelectInput 
                source="is_mandatory" 
                label="Mandatory" 
                choices={[
                    { id: true, name: 'Yes' },
                    { id: false, name: 'No' },
                ]} 
                defaultValue={true}
                fullWidth
            />
        </SimpleForm>
    </Create>
);

import { Edit, SimpleForm, TextInput, SelectInput, BooleanInput, FileInput, FileField, TopToolbar, ListButton, useRecordContext } from "react-admin";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";
import { DynamicCategoryInput } from "@/admin/atoms";
import { Box, Typography, Chip } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const DocumentEditActions = () => (
    <TopToolbar>
        <ListButton label="Back to Documents" />
    </TopToolbar>
);

/** Shows the currently attached file name + type as a read-only info row */
const CurrentFileInfo = () => {
    const record = useRecordContext();
    if (!record?.file_name) return null;

    const sizeKB = record.file_size ? `${(Number(record.file_size) / 1024).toFixed(1)} KB` : null;

    return (
        <Box sx={{ mb: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertDriveFileIcon fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {record.file_name}
            </Typography>
            {record.file_type && (
                <Chip label={record.file_type} size="small" variant="outlined" />
            )}
            {sizeKB && (
                <Typography variant="caption" color="text.secondary">
                    ({sizeKB})
                </Typography>
            )}
        </Box>
    );
};

/**
 * Transform strips the `file` field when it has no rawFile (i.e. no new file
 * was selected).  React Admin re-sends existing field values on every save;
 * because the DB record has no `file` column the value is `undefined`, and
 * downstream code (FileField) calls `.split()` on it → crash.
 */
const transformDocument = (data: Record<string, unknown>) => {
    const cleaned = { ...data };
    // Only keep `file` when the user actually picked a new file
    if (!cleaned.file || !(cleaned.file as any)?.rawFile) {
        delete cleaned.file;
    }
    return cleaned;
};

export const DocumentEdit = () => (
    <Edit actions={<DocumentEditActions />} transform={transformDocument}>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline fullWidth />
            <DynamicCategoryInput source="category" required />
            <TextInput source="recipient" label="Recipient" fullWidth />
            <BooleanInput source="is_featured" label="Featured" />
            <CurrentFileInfo />
            <FileInput 
                source="file" 
                label="Replace File (optional)" 
                accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/zip': ['.zip'],
                }}
                placeholder="Drop a file here to replace the current document, or click to select"
            >
                <FileField source="src" title="title" />
            </FileInput>
        </SimpleForm>
    </Edit>
);

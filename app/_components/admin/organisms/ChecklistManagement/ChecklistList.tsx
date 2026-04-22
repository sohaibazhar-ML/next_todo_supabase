import React, { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    EditButton,
    DeleteButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    useNotify,
    useRefresh,
} from 'react-admin';
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { AdminFilePicker } from '@/admin/atoms';

const ChecklistListActions = ({ onImportClick }: { onImportClick: () => void }) => (
    <TopToolbar>
        <CreateButton />
        <Button
            size="small"
            color="primary"
            onClick={onImportClick}
            startIcon={<UploadFileIcon />}
        >
            Import Checklist
        </Button>
        <ExportButton />
    </TopToolbar>
);

const ChecklistEmpty = ({ onImportClick }: { onImportClick: () => void }) => (
    <Box textAlign="center" m={5}>
        <Typography variant="h4" paragraph>
            No Checklist yet.
        </Typography>
        <Typography variant="body1" gutterBottom>
            Do you want to add one or import from a file?
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
            <CreateButton variant="contained" />
            <Button
                variant="contained"
                color="primary"
                onClick={onImportClick}
                startIcon={<UploadFileIcon />}
                sx={{ ml: 2 }}
            >
                Import Checklist
            </Button>
        </Box>
    </Box>
);

export const ChecklistList = () => {
    const [importOpen, setImportOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const notify = useNotify();
    const refresh = useRefresh();

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/checklist/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                notify(result.message, { type: 'success' });
                setImportOpen(false);
                setFile(null);
                refresh();
            } else {
                throw new Error(result.error || 'Import failed');
            }
        } catch (error: any) {
            notify(error.message, { type: 'error' });
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            <List 
                actions={<ChecklistListActions onImportClick={() => setImportOpen(true)} />}
                empty={<ChecklistEmpty onImportClick={() => setImportOpen(true)} />}
            >
                <Datagrid rowClick="edit">
                    <TextField source="phase" />
                    <TextField source="category" />
                    <TextField source="title" label="Task" />
                    <TextField source="description" />
                    <BooleanField source="is_mandatory" label="Mandatory" />
                    <Box display="flex">
                        <EditButton />
                        <DeleteButton />
                    </Box>
                </Datagrid>
            </List>

            <Dialog open={importOpen} onClose={() => !importing && setImportOpen(false)}>
                <DialogTitle>Import Checklist from Excel/CSV</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Select an Excel (.xlsx) or CSV file containing columns: Phase, Kategorie, ToDo, Beschreibung, Pflicht.
                    </Typography>
                    <AdminFilePicker
                        file={file}
                        onChange={setFile}
                        accept=".xlsx, .xls, .csv"
                        disabled={importing}
                        helperText="Accepted formats: .xlsx, .xls, .csv"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImportOpen(false)} disabled={importing}>Cancel</Button>
                    <Button
                        onClick={handleImport}
                        color="primary"
                        variant="contained"
                        disabled={!file || importing}
                    >
                        {importing ? 'Importing...' : 'Upload & Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

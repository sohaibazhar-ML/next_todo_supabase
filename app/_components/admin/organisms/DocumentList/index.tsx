import React, { useState } from "react";
import { List, Datagrid, TextField, DateField, NumberField, usePermissions, FunctionField, useRecordContext, TopToolbar, CreateButton, ExportButton, useNotify, useRefresh, FilterButton, SearchInput, DateInput } from "react-admin";
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { DynamicCategoryInput, AdminFilePicker } from "@/admin/atoms";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const CustomFeaturedField = ({ source, label }: { source: string; label?: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    const value = record[source];
    return value ? (
        <CheckIcon sx={{ color: '#4caf50' }} fontSize="small"  />
    ) : (
        <ClearIcon sx={{ color: '#f44336' }} fontSize="small" />
    );
};

const DocumentListActions = (props: any) => {
    const { onImportClick, permissions, filters, ...rest } = props;
    return (
        <TopToolbar {...rest}>
            <FilterButton filters={filters} />
            {permissions === 'admin' && <CreateButton />}
            <Button
                size="small"
                color="primary"
                onClick={onImportClick}
                startIcon={<UploadFileIcon />}
            >
                Import Placeholders
            </Button>
            <ExportButton />
        </TopToolbar>
    );
};

const DocumentEmpty = ({ onImportClick, permissions }: { onImportClick: () => void, permissions: any }) => (
    <Box textAlign="center" m={5}>
        <Typography variant="h4" paragraph>
            No Documents yet.
        </Typography>
        <Typography variant="body1" gutterBottom>
            Do you want to add one or import placeholders?
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
            {permissions === 'admin' && <CreateButton variant="contained" />}
            <Button
                variant="contained"
                color="primary"
                onClick={onImportClick}
                startIcon={<UploadFileIcon />}
                sx={{ ml: 2 }}
            >
                Import Placeholders
            </Button>
        </Box>
    </Box>
);

export const DocumentList = () => {
    const { permissions } = usePermissions();
    const [importOpen, setImportOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const notify = useNotify();
    const refresh = useRefresh();

    const filters = [
        <SearchInput key="q" placeholder="Search Title, Category, Type..." source="q" alwaysOn />,
        <DynamicCategoryInput key="cat" label="Category" source="category" fullWidth={false} />,
        <DateInput key="from" label="From Date" source="fromDate" />,
        <DateInput key="to" label="To Date" source="toDate" />,
    ];

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/documents/import', {
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
                filters={filters} 
                actions={<DocumentListActions filters={filters} onImportClick={() => setImportOpen(true)} permissions={permissions} />}
                empty={<DocumentEmpty onImportClick={() => setImportOpen(true)} permissions={permissions} />}
            >
                <Datagrid rowClick="edit" bulkActionButtons={permissions === 'admin'}>
                    <TextField source="title" />
                    <TextField source="file_name" label="File Name" />
                    <TextField source="category" />
                    <TextField source="recipient" label="Recipient" />
                    <TextField source="file_type" label="Type" />
                    <FunctionField label="Size (KB)" render={(record: any) => record.file_size ? `${(record.file_size / 1024).toFixed(1)} KB` : '0 KB'} />
                    <NumberField source="download_count" label="Downloads" />
                    <DateField source="created_at" label="Created" showTime />
                    <CustomFeaturedField source="is_featured" label="Featured" />
                </Datagrid>
            </List>

            <Dialog open={importOpen} onClose={() => !importing && setImportOpen(false)}>
                <DialogTitle>Import Document Placeholders</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Select the Excel file containing document names and categories. 
                        The system will create placeholders that can later be replaced with actual files.
                    </Typography>
                    <Box mt={2}>
                        <AdminFilePicker 
                            file={file}
                            onChange={setFile}
                            accept=".xlsx, .xls"
                            disabled={importing}
                            helperText="Accepted formats: .xlsx, .xls"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImportOpen(false)} disabled={importing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleImport} 
                        color="primary" 
                        variant="contained"
                        disabled={!file || importing}
                    >
                        {importing ? 'Importing...' : 'Start Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

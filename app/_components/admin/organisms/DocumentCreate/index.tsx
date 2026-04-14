import React from "react";
import { Create, SimpleForm, TextInput, SelectInput, FileInput, FileField, BooleanInput } from "react-admin";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";
import { Box, Typography, Button } from "@mui/material";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

export const DocumentCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline fullWidth />
            <SelectInput
                source="category"
                choices={[...DOCUMENT_CATEGORIES]}
                required
            />
            <TextInput source="tags" helperText="Separate tags with commas" fullWidth />

            <FileInput
                source="file"
                label=""
                multiple
                accept={{
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/zip': ['.zip'],
                    'application/x-zip-compressed': ['.zip']
                }}
                placeholder={
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        py={4}
                    >
                        <FileUploadOutlinedIcon sx={{ fontSize: 64, color: '#2196F3', mb: 2 }} />
                        <Button
                            variant="contained"
                            component="span" // important to prevent click bubbling weirdness sometimes, but dropzone handles it
                            sx={{
                                bgcolor: '#2196F3',
                                borderRadius: 6,
                                px: 4,
                                py: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                mb: 2,
                                boxShadow: 'none',
                                pointerEvents: 'none', // let dropzone register the click
                                '&:hover': {
                                    bgcolor: '#1976D2',
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            Browse
                        </Button>
                        <Typography variant="body1" sx={{ color: '#9ca3af', mb: 1 }}>
                            drop a file here
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                            <span style={{ color: '#ef4444' }}>*</span>File supported .pdf, .docx, .xlsx & .zip
                        </Typography>
                    </Box>
                }
                sx={{
                    width: '100%',
                    mb: 3,
                    '& .RaFileInput-dropZone': {
                        border: '2px dashed #2196F3',
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s',
                        display: 'flex',
                        minHeight: '250px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#e3f2fd',
                            borderColor: '#1976D2'
                        }
                    }
                }}
            >
                <FileField source="src" title="title" />
            </FileInput>

            <BooleanInput source="is_featured" label="Featured" />
            <TextInput source="searchable_content" multiline fullWidth label="Searchable Content (for OCR)" />
        </SimpleForm>
    </Create>
);

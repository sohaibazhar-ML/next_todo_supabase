import React, { useRef } from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface AdminFilePickerProps {
    file: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    disabled?: boolean;
    helperText?: string;
}

export const AdminFilePicker: React.FC<AdminFilePickerProps> = ({
    file,
    onChange,
    accept = ".xlsx, .xls, .csv",
    disabled = false,
    helperText
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 1 }}>
            <input
                type="file"
                ref={inputRef}
                style={{ display: 'none' }}
                accept={accept}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                disabled={disabled}
            />
            
            <Paper
                variant="outlined"
                onClick={handleClick}
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: file ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    backgroundColor: file ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    '&:hover': {
                        borderColor: disabled ? 'divider' : 'primary.main',
                        backgroundColor: disabled ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                        transform: disabled ? 'none' : 'translateY(-2px)',
                        boxShadow: disabled ? 'none' : `0 6px 16px ${alpha(theme.palette.common.black, 0.06)}`,
                    },
                    '&:active': {
                        transform: disabled ? 'none' : 'translateY(0)',
                        boxShadow: 'none',
                    }
                }}
            >
                {file ? (
                    <>
                        <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="subtitle1" fontWeight="600" color="primary.main">
                            {file.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {(file.size / 1024).toFixed(1)} KB • Click to change
                        </Typography>
                    </>
                ) : (
                    <>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.7 }} />
                        <Typography variant="subtitle1" fontWeight="500">
                            Click to select a file
                        </Typography>
                        {helperText && (
                            <Typography variant="caption" color="textSecondary" textAlign="center">
                                {helperText}
                            </Typography>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
};

"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { DocumentRow, DashboardPagination } from '@/website/molecules';
import { Text, Button } from '@/website/atoms';
import { DocumentItem } from '@/website/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface MyDocumentsContentProps {
  documents: DocumentItem[];
  totalPages: number;
  currentPage: number;
}

export const MyDocumentsContent: React.FC<MyDocumentsContentProps> = ({
  documents,
  totalPages,
  currentPage,
}) => {
  const t = useTranslations('Dashboard.list');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setUploadError(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isUploading) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const isValidFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF, DOCX, XLSX, and ZIP files are allowed.');
      return false;
    }
    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be less than 50MB.');
      return false;
    }
    setUploadError(null);
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());

      const response = await fetch('/api/website/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setIsModalOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (ext === 'zip') return '📦';
    return '📎';
  };

  const itemsPerPage = 20;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="w-full flex flex-col">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between mb-6">
        <Text variant="text-m" className="text-secondary font-bold">
          My Documents
        </Text>
        <Button
          variant="primary"
          size="md"
          onClick={openModal}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Upload size={18} />
          Upload Document
        </Button>
      </div>

      {/* Top Pagination */}
      <DashboardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Document List */}
      <div className="w-full flex flex-col min-h-[400px]">
        {documents.map((doc, idx) => (
          <DocumentRow
            key={doc.id}
            document={doc}
            index={startIndex + idx}
          />
        ))}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-secondary/20">
            <div className="w-16 h-16 rounded-full bg-secondary/5 flex items-center justify-center mb-4">
              <FileText size={28} className="text-secondary/30" />
            </div>
            <Text variant="text-s" className="text-secondary/50 font-medium mb-2">
              No documents uploaded yet
            </Text>
            <Text variant="text-xxs" className="text-secondary/35 mb-6">
              Upload your first document to get started
            </Text>
            <Button
              variant="primary"
              size="sm"
              onClick={openModal}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              <Upload size={16} />
              Upload Document
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <DashboardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/10">
              <Text variant="text-s" className="text-secondary font-bold">
                Upload Document
              </Text>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="p-1.5 rounded-lg hover:bg-secondary/5 transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-secondary/50" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-semibold text-secondary/70 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  disabled={isUploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary/15 bg-white text-secondary placeholder:text-secondary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all text-sm disabled:opacity-50"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-secondary/70 mb-1.5">
                  Description <span className="text-secondary/30 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a brief description"
                  disabled={isUploading}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary/15 bg-white text-secondary placeholder:text-secondary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all text-sm resize-none disabled:opacity-50"
                />
              </div>

              {/* File Drop Zone */}
              <div>
                <label className="block text-sm font-semibold text-secondary/70 mb-1.5">
                  File <span className="text-red-400">*</span>
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                    ${dragActive 
                      ? 'border-secondary bg-secondary/5 scale-[1.01]' 
                      : selectedFile 
                        ? 'border-green-400/50 bg-green-50/50' 
                        : 'border-secondary/15 hover:border-secondary/30 hover:bg-secondary/[0.02]'
                    }
                    ${isUploading ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    className="hidden"
                    disabled={isUploading}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-secondary/40 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 rounded-md hover:bg-secondary/10 transition-colors"
                      >
                        <X size={16} className="text-secondary/40" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center mb-2">
                        <Upload size={20} className="text-secondary/30" />
                      </div>
                      <p className="text-sm text-secondary/50 font-medium">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-xs text-secondary/30 mt-1">
                        PDF, DOCX, XLSX, ZIP — Max 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200/50">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary/10 bg-secondary/[0.02]">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                disabled={isUploading}
                className="px-4 py-2 text-secondary/60 hover:text-secondary font-medium text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || isUploading}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/features/admin/documents/services/documentService';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { SerializedDocument } from '@/types';

export const useDocuments = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.DOCUMENTS, params],
        queryFn: () => documentService.getAll(params),
    });
};

export const useDocument = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.DOCUMENTS, id],
        queryFn: () => documentService.getById(id),
        enabled: !!id,
    });
};

export const useCreateDocumentMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: FormData) => documentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.DOCUMENTS] });
        },
    });
};

export const useUpdateDocumentMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SerializedDocument> }) => 
            documentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.DOCUMENTS] });
        },
    });
};

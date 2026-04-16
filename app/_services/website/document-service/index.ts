import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service for document-related data fetching.
 * Uses React.cache to memoize requests within a single render cycle,
 * preventing redundant database hits if multiple components 
 * need the same document data.
 */

export const getDocumentsCount = cache(async (where: Prisma.documentsWhereInput) => {
  return prisma.documents.count({ where });
});

export const getDocuments = cache(async (params: {
  where: Prisma.documentsWhereInput;
  orderBy?: Prisma.documentsOrderByWithRelationInput;
  skip?: number;
  take?: number;
}) => {
  return prisma.documents.findMany({
    where: params.where,
    orderBy: params.orderBy || { created_at: 'desc' },
    skip: params.skip,
    take: params.take,
  });
});

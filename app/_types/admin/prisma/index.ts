import { Prisma } from '@prisma/client';

export type Profile = Prisma.profilesGetPayload<{}>;
export type ProfileUpdateInput = Prisma.profilesUpdateInput;
export type DownloadLogWhereInput = Prisma.download_logsWhereInput;
export type DocumentWhereInput = Prisma.documentsWhereInput;
export type DocumentOrderByWithRelationInput = Prisma.documentsOrderByWithRelationInput;
export type DocumentUpdateInput = Prisma.documentsUpdateInput;

export interface ProfileWithUser extends Profile {
  user?: {
    email: string;
    username: string;
  };
}

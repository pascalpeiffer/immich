import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { Viewer } from 'src/database.js';
import { ViewerAlbumAccessSchema } from 'src/enum.js';
import { isoDatetimeToDate } from 'src/validation.js';

const ViewerResponseSchema = z
  .object({
    id: z.uuidv4().describe('Viewer ID'),
    userId: z.uuidv4().describe('User ID'),
    libraryId: z.uuidv4().describe('Library ID'),
    albumAccess: ViewerAlbumAccessSchema.describe('Album access level'),
    edit: z.boolean().describe('Edit permission'),
    delete: z.boolean().describe('Delete permission'),
    createdAt: isoDatetimeToDate.describe('Creation date'),
    updatedAt: isoDatetimeToDate.describe('Last update date'),
  })
  .meta({ id: 'ViewerResponseDto' });

const ViewerCreateSchema = z
  .object({
    userId: z.uuidv4().describe('User ID'),
    libraryId: z.uuidv4().describe('Library ID'),
  })
  .meta({ id: 'ViewerCreateDto' });

const ViewerUpdateSchema = z
  .object({
    albumAccess: ViewerAlbumAccessSchema.optional().describe('Album access level'),
    edit: z.boolean().optional().describe('Edit permission'),
    delete: z.boolean().optional().describe('Delete permission'),
  })
  .meta({ id: 'ViewerUpdateDto' });

export const mapViewer = (viewer: Viewer): ViewerResponseDto => {
  return {
    id: viewer.id,
    userId: viewer.userId,
    libraryId: viewer.libraryId,
    albumAccess: viewer.albumAccess,
    edit: viewer.edit,
    delete: viewer.delete,
    createdAt: viewer.createdAt,
    updatedAt: viewer.updatedAt,
  };
};

export class ViewerResponseDto extends createZodDto(ViewerResponseSchema) {}
export class ViewerCreateDto extends createZodDto(ViewerCreateSchema) {}
export class ViewerUpdateDto extends createZodDto(ViewerUpdateSchema) {}

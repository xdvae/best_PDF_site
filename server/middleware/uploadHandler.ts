import { Request, Response, NextFunction } from 'express';
import type { Multer } from 'multer';
import { storagePut } from '../storage';

type File = Express.Multer.File;

// File upload constraints
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES: 20,
  ALLOWED_PDF_TYPES: ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Validate uploaded files
 */
export function validateUploadedFiles(
  files: File[] | undefined,
  allowedTypes: string[] = UPLOAD_LIMITS.ALLOWED_PDF_TYPES
): { valid: boolean; error?: string } {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files uploaded' };
  }

  if (files.length > UPLOAD_LIMITS.MAX_FILES) {
    return { valid: false, error: `Maximum ${UPLOAD_LIMITS.MAX_FILES} files allowed` };
  }

  for (const file of files) {
    if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File ${file.originalname} exceeds maximum size of ${UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Upload files to S3 storage
 */
export async function uploadFilesToStorage(
  files: File[]
): Promise<Array<{ key: string; url: string; name: string; size: number; type: string }>> {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const { key, url } = await storagePut(
        `uploads/${fileName}`,
        file.buffer,
        file.mimetype
      );

      uploadedFiles.push({
        key,
        url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      });
    } catch (error) {
      console.error(`Failed to upload file ${file.originalname}:`, error);
      throw new Error(`Failed to upload file ${file.originalname}`);
    }
  }

  return uploadedFiles;
}

/**
 * Express middleware for file upload handling
 */
export function handleUploadError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: `File size exceeds maximum of ${UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: `Maximum ${UPLOAD_LIMITS.MAX_FILES} files allowed`,
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
    });
  }

  next(err);
}

import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/response.utils.js';

const storage: StorageEngine = multer.memoryStorage();

const resumeFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed for resume upload.', 400));
  }
};

const profilePictureFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only JPEG, PNG, and WebP images are allowed for profile picture.',
        400
      )
    );
  }
};

export const uploadResume = multer({
  storage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('resume');

export const uploadProfilePicture = multer({
  storage,
  fileFilter: profilePictureFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('profilePicture');

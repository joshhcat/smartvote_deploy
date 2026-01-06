import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { FileUploadUtil } from './file-upload.util';

export const multerConfig: MulterOptions = {
  storage: memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, callback) => {
    // Validate file type
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        ),
        false,
      );
    }
  },
};


import * as fs from 'fs';
import * as path from 'path';

// Type for uploaded file (compatible with multer)
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export class FileUploadUtil {
  // Directory where uploaded images will be stored
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'candidates');
  
  // Allowed image MIME types
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // Maximum file size (5MB)
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  /**
   * Ensure upload directory exists
   */
  static ensureUploadDir(): void {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Validate file
   */
  static validateFile(file: MulterFile): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file uploaded' };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    return `${timestamp}-${randomString}${ext}`;
  }

  /**
   * Save file to disk
   */
  static async saveFile(
    file: MulterFile,
    customFileName?: string,
  ): Promise<{ fileName: string; filePath: string; relativePath: string }> {
    // Ensure directory exists
    this.ensureUploadDir();

    // Generate filename
    const fileName = customFileName || this.generateFileName(file.originalname);
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Return relative path for database storage
    const relativePath = `/uploads/candidates/${fileName}`;

    return {
      fileName,
      filePath,
      relativePath,
    };
  }

  /**
   * Delete file from disk
   */
  static deleteFile(filePath: string): boolean {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get full URL for the uploaded file
   */
  static getFileUrl(relativePath: string, baseUrl?: string): string {
    const base = baseUrl || process.env.BASE_URL || 'http://localhost:3004';
    return `${base}${relativePath}`;
  }
}


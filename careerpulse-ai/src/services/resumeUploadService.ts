/**
 * Service for handling mobile and desktop resume uploads
 * Supports PDF, Text, Markdown and base64 parsing for AI processing
 */

export interface ParsedFileResult {
  fileName: string;
  fileSize: string;
  fileType: string;
  rawText: string;
  base64Data?: string;
  mimeType?: string;
}

export const resumeUploadService = {
  /**
   * Format file size to human readable format (KB, MB)
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /**
   * Read file content as text and base64 for server processing
   */
  async processUploadedFile(file: File): Promise<ParsedFileResult> {
    const sizeFormatted = this.formatSize(file.size);
    const fileName = file.name;
    const fileType = file.type || 'application/octet-stream';

    // If text/markdown/json, read directly as text
    if (fileType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const text = await file.text();
      return {
        fileName,
        fileSize: sizeFormatted,
        fileType,
        rawText: text
      };
    }

    // For PDF / Word / Binary files, read as Data URL (base64)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1] || '';
        
        // Extract plain text fallback hints if possible or prepare for server OCR/Gemini parse
        const textFallback = `[Uploaded File: ${fileName} (${sizeFormatted})]`;
        
        resolve({
          fileName,
          fileSize: sizeFormatted,
          fileType,
          rawText: textFallback,
          base64Data,
          mimeType: fileType
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};

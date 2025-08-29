/**
 * Utility functions for file field handling in forms
 */
export const FileFieldUtils = {
  /**
   * Transform file data from API format to UI format
   * @param {Array} apiFiles - File data from API
   * @returns {Array} - UI formatted file data
   */
  toUIFormat: (apiFiles) => {
    if (!apiFiles || !Array.isArray(apiFiles)) return [];
    
    return apiFiles.map((file, index) => ({
      id: file.Id || `api-file-${index}`,
      name: file.Name || file.fileName || 'Unknown file',
      path: file.Path || file.path || '',
      size: file.Size || file.fileSize || 0,
      type: file.Type || file.fileType || 'unknown',
      isExternal: file.IsExternal || file.isExternal || false,
      ordinal: file.Ordinal || file.ordinal || index + 1,
      // Keep reference to original data for updates
      _originalData: file
    }));
  },

  /**
   * Transform file data from UI format to API format for creating records
   * @param {Array} uiFiles - File data from UI
   * @returns {Array} - API formatted file data for create
   */
  toCreateFormat: (uiFiles) => {
    if (!uiFiles || !Array.isArray(uiFiles)) return null;
    if (uiFiles.length === 0) return null;
    
    return uiFiles.map((file, index) => ({
      Name: file.name,
      Path: file.path,
      Size: FileFieldUtils.convertBytesInKB(file.size),
      Type: file.type,
      IsExternal: file.isExternal || false,
      Ordinal: index + 1
    }));
  },

  /**
   * Transform file data from UI format to API format for updating records
   * @param {Array} uiFiles - File data from UI
   * @param {Array} originalFiles - Original file data for fallback
   * @returns {Array} - API formatted file data for update
   */
  toUpdateFormat: (uiFiles, originalFiles = []) => {
   
    if (!uiFiles || !Array.isArray(uiFiles)) return null;
    if (uiFiles.length === 0) return null;
    
    return uiFiles.map((file, index) => {
      // Check if this file has original data (was previously uploaded)
      if (file._originalData) {
        console.log('file:', file);
        
        // File was already uploaded, include Id for update
        return {
          Id: file._originalData.Id,
          ParentRecordId: file._originalData.ParentRecordId,
          Name: file.name,
          Path: file.path,
          Size: FileFieldUtils.convertBytesInKB(file.size),
          Type: file.type,
          IsExternal: file.isExternal || false,
          Ordinal: index + 1
        };
      } else {
        // Check if this file was already uploaded (exists in original data)
        const existingFile = originalFiles.find(orig => 
          orig.path === file.path || orig.name === file.name
        );
        
        if (existingFile) {
          // File was already uploaded, include Id for update
          return {
            Id: existingFile.Id || existingFile.id,
            ParentRecordId: existingFile.ParentRecordId,
            Name: file.name,
            Path: file.path,
            Size: file.size,
            Type: file.type,
            IsExternal: file.isExternal || false,
            Ordinal: index + 1
          };
        } else {
          // New file upload, only include file data
          return {
            Name: file.name,
            Path: file.path,
            Size: FileFieldUtils.convertBytesInKB(file.size),
            Type: file.type,
            IsExternal: file.isExternal || false,
            Ordinal: index + 1
          };
        }
      }
    });
  },

  /**
   * Merge existing files with new files
   * @param {Array} existingFiles - Current files
   * @param {Array} newFiles - New files to add
   * @returns {Array} - Merged file list
   */
  mergeFiles: (existingFiles = [], newFiles = []) => {
    const merged = [...existingFiles];
    
    newFiles.forEach(newFile => {
      // Check if file already exists (avoid duplicates)
      const exists = merged.some(existing => 
        existing.path === newFile.path || 
        (existing.name === newFile.name && existing.size === newFile.size)
      );
      
      if (!exists) {
        merged.push(newFile);
      }
    });
    
    return merged;
  },

  /**
   * Remove a file from the file list
   * @param {Array} files - Current files
   * @param {string} fileId - ID of file to remove
   * @returns {Array} - Updated file list
   */
  removeFile: (files = [], fileId) => {
    return files.filter(file => file.id !== fileId);
  },

  /**
   * Get appropriate icon name for file type
   * @param {string} fileType - File type/extension
   * @returns {string} - Icon name
   */
  getFileIcon: (fileType) => {
    if (!fileType) return 'File';
    
    const type = fileType.toLowerCase();
    
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type)) {
      return 'Image';
    }
    if (type.includes('pdf') || type === 'pdf') {
      return 'FileText';
    }
    if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(type)) {
      return 'Video';
    }
    if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac'].includes(type)) {
      return 'Music';
    }
    if (['doc', 'docx'].includes(type)) {
      return 'FileText';
    }
    if (['xls', 'xlsx'].includes(type)) {
      return 'Grid';
    }
    if (['ppt', 'pptx'].includes(type)) {
      return 'Presentation';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
      return 'Archive';
    }
    
    return 'File';
  },

  /**
   * Format file size in human readable format
   * @param {number} sizeInKB - File size in KB
   * @returns {string} - Formatted file size
   */
  formatFileSize: (sizeInKB) => {
    if (!sizeInKB || sizeInKB === 0) return '0 KB';
    if (isNaN(sizeInKB)) return '';
    
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    
    // If less than 1 MB (1024 KB), show in KB
    if (sizeInKB < k) {
      return parseFloat(sizeInKB.toFixed(2)) + ' KB';
    }
    
    // For larger sizes, calculate the appropriate unit
    const i = Math.floor(Math.log(sizeInKB) / Math.log(k));
    const adjustedIndex = Math.min(i, sizes.length - 1);
    
    return parseFloat((sizeInKB / Math.pow(k, adjustedIndex)).toFixed(2)) + ' ' + sizes[adjustedIndex];
  },
  convertBytesInKB: (sizeInBytes) => {
    if (!sizeInBytes || sizeInBytes === 0) return 0;
    if (isNaN(sizeInBytes)) return 0;
    
    // Convert bytes to kilobytes (1 KB = 1024 bytes)
    const sizeInKB = sizeInBytes / 1024;
    
    // Round to nearest integer
    return sizeInKB;
  },

  /**
   * Validate file size and type
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  validateFile: (file, options = {}) => {
    const { maxSize = 5 * 1024 * 1024 * 1024, allowedTypes = [] } = options;
    const errors = [];
    
    // Check file size (convert bytes to KB for display)
    if (file.size > maxSize) {
      const fileSizeInKB = Math.round(file.size / 1024);
      const maxSizeInKB = Math.round(maxSize / 1024);
      errors.push(`File size (${FileFieldUtils.formatFileSize(fileSizeInKB)}) exceeds maximum allowed size (${FileFieldUtils.formatFileSize(maxSizeInKB)})`);
    }
    
    // Check file type
    if (allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const isAllowed = allowedTypes.some(allowedType => {
        const normalizedType = allowedType.toLowerCase().replace('.', '');
        return fileExtension === normalizedType || mimeType.includes(normalizedType);
      });
      
      if (!isAllowed) {
        errors.push(`File type "${fileExtension}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
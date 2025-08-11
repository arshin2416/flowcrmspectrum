import { toast } from "react-toastify";
import { getFileIcon, convertFileSize } from './utils';

/**
 * Centralized File Upload Utilities
 * Contains reusable functions for file upload handling across components
 */
export const FileUploadUtils = {
  /**
   * Format existing files for ApperFile component display
   * @param {Array} existingFiles - Array of existing file objects from API
   * @returns {Array} - Formatted files for ApperFile component
   */
  formatExistingFilesForDisplay: (existingFiles = []) => {
    return existingFiles.map((file, index) => ({
      details: {
        id: file.Id,
        name: file.Name,
        size: file.Size * 1024, // Convert KB back to bytes for consistent handling
        type: file.Type,
        icon: getFileIcon(file.Name),
        parentRecordId: file.ParentRecordId,
        ordinal: file.Ordinal,
        path: file.Path
      },
      data: {
        isUploaded: true, // Mark as uploaded so it shows with green checkmark
        isFailed: false,
        isUploadInProgress: false,
        progress: 100,
        sizeText: convertFileSize(file.Size * 1024) // Convert and format size properly
      },
      // Keep original data for API calls
      Id: file.Id,
      Name: file.Name,
      Size: file.Size,
      Type: file.Type,
      ParentRecordId: file.ParentRecordId,
      Ordinal: file.Ordinal,
      Path: file.Path,
      // Add a unique key for the file
      _fileKey: `existing_${file.Id}_${index}`
    }));
  },

  /**
   * Extract uploaded files with signature data from ApperFile component
   * @param {Array} files - Files array from ApperFile component
   * @returns {Array} - Formatted files for form submission
   */
  extractUploadedFiles: (files) => {
    return files
      .filter(file => file.data?.isUploaded && file.data?.signatureResponse)
      .map(file => ({
        name: file.details.name,
        size: file.details.size,
        type: file.details.type,
        path: file.data.signatureResponse.path,
        signatureResponse: file.data.signatureResponse,
        // Structure for display
        details: {
          name: file.details.name,
          size: file.details.size,
          type: file.details.type
        }
      }));
  },

  /**
   * Combine existing and new uploaded files
   * @param {Array} existingFiles - Already formatted existing files
   * @param {Array} newUploadedFiles - New uploaded files
   * @returns {Array} - Combined files array
   */
  combineFiles: (existingFiles, newUploadedFiles) => {
    const existing = existingFiles.filter(file => file.Id && file.ParentRecordId);
    return [...existing, ...newUploadedFiles];
  },

  /**
   * Create file event handlers for a component
   * @param {Object} options - Configuration options
   * @param {Function} options.setUploadedFiles - State setter for uploaded files
   * @param {Function} options.setDeletedFiles - State setter for deleted files
   * @param {Function} options.setFormData - State setter for form data (optional)
   * @param {Array} options.uploadedFiles - Current uploaded files array
   * @param {Array} options.deletedFiles - Current deleted files array
   * @returns {Object} - Object containing event handler functions
   */
  createEventHandlers: ({
    setUploadedFiles,
    setDeletedFiles,
    setFormData,
    uploadedFiles,
    deletedFiles
  }) => {
    return {
      /**
       * Handle file upload completion
       * @param {Event} event - Event object
       * @param {Object} data - Upload completion data
       */
      handleFileUploadComplete: (event, data) => {
        console.log('Files uploaded successfully:', data);
      },

      /**
       * Handle files update from ApperFile component
       * @param {Array} files - Files array from ApperFile
       */
      handleFilesUpdate: (files) => {
        const newUploadedFiles = FileUploadUtils.extractUploadedFiles(files);
        const existingFiles = uploadedFiles.filter(file => file.Id && file.ParentRecordId);
        const combinedFiles = FileUploadUtils.combineFiles(existingFiles, newUploadedFiles);
        
        setUploadedFiles(combinedFiles);
        
        // Update form data if setter is provided
        if (setFormData) {
          setFormData(prev => ({ ...prev, files_1_c: combinedFiles }));
        }
        
        console.log('Updated files for form:', combinedFiles);
      },

      /**
       * Handle file upload errors
       * @param {Event} event - Event object
       * @param {Object} data - Error data
       */
      handleFileError: (event, data) => {
        console.error('File upload error:', data);
        toast.error('File upload failed');
      },

      /**
       * Handle file removal
       * @param {Event} event - Event object
       * @param {Object} data - File removal data
       */
      handleFileRemoved: (event, data) => {
        console.log('File removal requested:', data);
        
        // Determine the correct index based on data structure
        let fileIndex = data.index;
        let fileToRemove;
        
        // Handle different data structures from ApperFile component
        if (data.type === 'existing' && data.file) {
          // Find the file in uploadedFiles array that matches the removed file
          fileIndex = uploadedFiles.findIndex(file => 
            file.details?.id === data.file.details?.id || 
            file.Id === data.file.details?.id ||
            file._fileKey === data.file._fileKey
          );
          fileToRemove = uploadedFiles[fileIndex];
        } else {
          // Standard case - use provided index
          fileToRemove = uploadedFiles[fileIndex];
        }
        
        if (fileToRemove && fileIndex >= 0) {
          // If it's an existing file (has Id and ParentRecordId), add to deleted list
          if (fileToRemove.Id && fileToRemove.ParentRecordId && setDeletedFiles) {
            setDeletedFiles(prev => {
              // Avoid duplicates
              const alreadyMarked = prev.some(deleted => deleted.Id === fileToRemove.Id);
              if (!alreadyMarked) {
                return [...prev, {
                  Id: fileToRemove.Id,
                  ParentRecordId: fileToRemove.ParentRecordId
                }];
              }
              return prev;
            });
          }
          
          // Remove file from uploaded files array
          const updatedFiles = uploadedFiles.filter((_, index) => index !== fileIndex);
          setUploadedFiles(updatedFiles);
          
          // Update form data if setter is provided (but don't trigger record update)
          if (setFormData) {
            setFormData(prev => ({ ...prev, files_1_c: updatedFiles }));
          }
          
          console.log('File removed from display:', fileToRemove);
          console.log('Updated files array:', updatedFiles);
          
          if (fileToRemove.Id && fileToRemove.ParentRecordId) {
            console.log('Existing file marked for deletion (will be processed on record save):', fileToRemove.Id);
          }
        } else {
          console.warn('File not found for removal:', data);
        }
      }
    };
  },

  /**
   * Filter files to remove deleted ones
   * @param {Array} uploadedFiles - Current uploaded files
   * @param {Array} deletedFiles - Files marked for deletion
   * @returns {Array} - Filtered files excluding deleted ones
   */
  filterDeletedFiles: (uploadedFiles, deletedFiles) => {
    return uploadedFiles.filter(file => {
      // If it's an existing file, check if it's not in the deleted list
      if (file.Id && file.ParentRecordId) {
        return !deletedFiles.some(deleted => deleted.Id === file.Id);
      }
      // For new files, keep them
      return true;
    });
  },

  /**
   * Reset file upload state
   * @param {Function} setUploadedFiles - State setter for uploaded files
   * @param {Function} setDeletedFiles - State setter for deleted files
   */
  resetFileState: (setUploadedFiles, setDeletedFiles) => {
    setUploadedFiles([]);
    setDeletedFiles([]);
  },

  /**
   * Get ApperFile props for consistent configuration
   * @param {Object} options - Configuration options
   * @returns {Object} - ApperFile component props
   */
  getApperFileProps: (options = {}) => {
    return {
      multiple: options.multiple ?? true,
      properties: {
        maxSize: options.maxSize || 1050000000, // 5MB default
        extensions: options.extensions || 'jpg,png,pdf,doc,docx',
        auto: options.auto ?? true,
        ...options.properties
      },
      buttonProperties: {
        variant: 'secondary',
        label: 'Upload Files',
        ...options.buttonProperties
      },
      variant: options.variant || 'upload',
      purpose: options.purpose || 'RecordAttachment',
      attachmentLayout: options.attachmentLayout || 'block',
      showNewUploadedFiles: options.showNewUploadedFiles ?? true,
      ...options
    };
  },

  /**
   * Create defensive file props for ApperFile component to prevent direct manipulation
   * @param {Array} uploadedFiles - Current uploaded files
   * @param {Array} deletedFiles - Current deleted files
   * @returns {Object} - Defensive files object for ApperFile
   */
  createDefensiveFileProps: (uploadedFiles, deletedFiles) => {
    // Create deep copies to prevent direct manipulation
    return {
      deleted: [...(deletedFiles || [])],
      existing: uploadedFiles.filter(file => file.Id && file.ParentRecordId).map(file => ({ ...file })),
      new: uploadedFiles.filter(file => !file.Id || !file.ParentRecordId).map(file => ({ ...file })),
      hasDeleted: (deletedFiles || []).length > 0
    };
  },

  /**
   * Extract numeric value from convertFileSize string (e.g., "458.51 KB" -> 458.51)
   * @param {number} bytes - File size in bytes
   * @returns {number} - File size in KB as number
   */
  getFileSizeInKB: (bytes) => {
    const sizeString = convertFileSize(bytes); // Returns "458.51 KB"
    return parseFloat(sizeString.split(' ')[0]); // Extract just the number
  },

  /**
   * Format uploaded files data for API submission
   * @param {Array} uploadedFiles - Array of uploaded file objects  
   * @param {boolean} isUpdate - Whether this is for update (handles existing files)
   * @returns {Array} - Formatted files array for API
   */
  formatFilesForAPI: (uploadedFiles, isUpdate = false) => {
    if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      return null;
    }

    console.log('uploadedFiles**:', uploadedFiles);
    
    return uploadedFiles.map((file, index) => {
      // Check if this is an existing file (has Id and ParentRecordId)
      const isExistingFile = file.Id && file.ParentRecordId;
      
      if (isExistingFile) {
        // Existing file format for updates
        return {
          Id: file.Id,
          Type: file.Type || file.type,
          Name: file.Name || file.name,
          Size: file.Size || FileUploadUtils.getFileSizeInKB(file.size),
          IsExternal: file.IsExternal || false,
          ParentRecordId: file.ParentRecordId,
          Ordinal: file.Ordinal || (index + 1),
          Path: file.Path || file.path
        };
      } else {
        // New file format (for both create and update)
        return {
          Path: file.signatureResponse?.key || file.path,
          Size: FileUploadUtils.getFileSizeInKB(file.size),
          Type: file.type,
          Name: file.name,
          IsExternal: false,
          Ordinal: index + 1
        };
      }
    });
  }
};

export default FileUploadUtils; 
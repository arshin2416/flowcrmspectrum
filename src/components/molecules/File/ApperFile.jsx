import React, { useState, useEffect, useRef } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { useFileContext } from '@/contexts/FileContext';

const { ApperFileUploader, ApperClient } = window.ApperSDK;

const ApperFile = ({ 
    fieldId, // Required: unique identifier for this file field
    label = "Files", 
    initialFiles = [], 
    onFilesChange = () => {}, 
    maxFiles = 50, 
    maxFileSize = 5 * 1024 * 1024 * 1024, // 5GB
    allowedTypes = ['pdf', 'jpg', 'png', 'doc', 'docx'],
    isRequired = false,
    error = null,
    disabled = false,
    targetElementId = null, // Will be auto-generated if not provided
    allowMultiple = false
}) => {
    const [apperClient, setApperClient] = useState(null);
    const [isReady, setIsReady] = useState(false);
    
    // Use FileContext instead of local state
    const { 
        initializeField, 
        updateFiles, 
        getFieldState, 
        setUploading, 
        setError 
    } = useFileContext();
    
    // Get field state from context
    const fieldState = getFieldState(fieldId);
    const { files: uploadedFiles, isUploading, error: uploaderError } = fieldState;
    
    // Generate unique target element ID if not provided
    const elementId = targetElementId || `file-uploader-${fieldId}`;

    // Validate required fieldId prop
    if (!fieldId) {
        throw new Error('ApperFile: fieldId prop is required');
    }

    // Initialize ApperClient and store it in state
    useEffect(() => {
        const initializeClient = async () => {
            try {
                // Wait for ApperSDK to be available
                while (!window.ApperSDK) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const clientConfig = {
                    apperProjectId: "600c31700dfe4ae88009ac4c221f5d83",
                    apperPublicKey: "123",
                };
                
                
                const client = new ApperClient(clientConfig);
                setApperClient(client); // Store in state!
                setIsReady(true);
                
                
            } catch (err) {
                console.error('❌ Failed to initialize ApperClient:', err);
                setError(fieldId, `Initialization failed: ${err.message}`);
            }
        };

        initializeClient();
    }, [fieldId, setError]);

    // Initialize the field in context and handle initial files
    useEffect(() => {
        // Initialize field in context
        initializeField(fieldId, []);
        
        // Handle initial files if provided
        if (initialFiles && Array.isArray(initialFiles) && initialFiles.length > 0) {
            // Check if initialFiles are already in UI format or need conversion
            let formattedFiles;
            if (initialFiles[0].Id !== undefined) {
                // These are API format files, convert to UI format
                formattedFiles = ApperFileUploader.toUIFormat(initialFiles);
            } else {
                // These are already UI format files, use as-is but ensure they have all required properties
                formattedFiles = initialFiles.map(file => ({
                    ...file,
                    // Ensure all required properties exist
                    name: file.name || file.Name || '',
                    path: file.path || file.Path || '',
                    size: file.size || file.Size || 0,
                    type: file.type || file.Type || '',
                    isExternal: file.isExternal || file.IsExternal || false,
                    ordinal: file.ordinal || file.Ordinal || 1
                }));
            }
            
            // Update files in context
            updateFiles(fieldId, formattedFiles);
        }
    }, [fieldId, initializeField, updateFiles]); // Removed initialFiles from deps to prevent loops

    // Notify parent component when files change
    useEffect(() => {
        if (typeof onFilesChange === 'function') {
            onFilesChange(uploadedFiles);
        }
    }, [uploadedFiles, onFilesChange]);

    useEffect(() => {
        if (isReady && !disabled) {
            showUploader();
        }
    }, [isReady, disabled]);

    // Helper function to update files in context
    const handleFilesUpdate = (newFiles) => {
        updateFiles(fieldId, newFiles);
    };

    // Remove a file from the uploaded files
    const removeFile = (fileId) => {
        const newFiles = ApperFileUploader.removeFile(uploadedFiles, fileId);
        handleFilesUpdate(newFiles);
    };

    // Show file uploader UI
    const showUploader = async () => {
        
        if (!apperClient) {
            console.warn('ApperClient not ready yet!');
            return;
        }

        try {
            setError(fieldId, null);

            const config = {
                // UI Configuration
                title: 'Upload',
                description: 'Select files to upload',
                allowMultiple: allowMultiple, //value from the fields property
                maxFiles: 50, //by default 50
                maxFileSize: maxFileSize,
                allowedTypes: allowedTypes,
                showRestrictions: true,
                autoUpload: true,
                
                // Existing files to display - ensure this includes all current files
                existingFiles: uploadedFiles,
                
                // Upload Configuration
                uploadConfig: {
                    // For INTERNAL usage (with canvas)
                    canvasUniqueId: '600c31700dfe4ae88009ac4c221f5d83',
                    purpose: 'RecordAttachment',
                    isExternal: false, // FIXED: false for internal usage
                    
                    apperClient: apperClient,
                },
                
                // File state change callback
                onUploadedFilesChanged: (files) => {
                    handleFilesUpdate(files);
                },
                
                // Event Callbacks
                onSuccess: (results) => {
                    console.log('✅ Upload successful:', results);
                    setUploading(fieldId, false);
                    
                    // Note: File state updates are now primarily handled by onUploadedFilesChanged callback
                    // This ensures we always have the latest state from the uploader component
                },
                
                onError: (error) => {
                    console.error('❌ Upload failed:', error);
                    setUploading(fieldId, false);
                    setError(fieldId, error.message || 'Upload failed');
                },

                onProgress: (progress) => {
                    setUploading(fieldId, true);
                }
            };
            // Mount the Vue component in React
            await ApperFileUploader.showFileUploader(
                elementId,
                config
            );
            
            console.log('✅ File uploader UI mounted successfully');

        } catch (err) {
            console.error('❌ Failed to show uploader:', err);
            setError(fieldId, `Failed to show uploader: ${err.message}`);
        }
    };

    // Reset uploader
    // const resetUploader = () => {
    //     const container = document.getElementById(elementId);
    //     if (container) {
    //         container.innerHTML = '';
    //     }
    //     setError(fieldId, null);
    //     handleFilesUpdate([]);
    // };

    // Refresh uploader with current files
    const refreshUploader = async () => {
        if (isReady && !disabled) {
            await showUploader();
        }
    };

    return (
        <div className="space-y-4">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Error Display */}
            {(error || uploaderError) && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                        <ApperIcon name="AlertCircle" className="w-4 h-4" />
                        <span>{error || uploaderError}</span>
                    </div>
                </div>
            )}

            

            {/* Upload Status */}
            {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading files...</span>
                </div>
            )}

            {/* File Uploader Container */}
            <div 
                id={elementId}
                className={`min-h-[200px] border-2 border-dashed border-slate-300 rounded-lg ${
                    disabled ? 'bg-slate-50 opacity-50' : 'bg-white'
                }`}
            >
                {!isReady && (
                    <div className="flex items-center justify-center h-48 text-slate-500">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                            <div className="text-sm">Initializing file uploader...</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            {/* <div className="flex space-x-2">
                {uploadedFiles.length > 0 && !disabled && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon="RotateCcw"
                        onClick={resetUploader}
                    >
                        Reset
                    </Button>
                )}
            </div> */}
        </div>
    );
};

export default ApperFile;
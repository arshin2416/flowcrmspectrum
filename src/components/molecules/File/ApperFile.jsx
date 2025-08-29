import React, { useState, useEffect, useRef } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { FileFieldUtils } from '@/services/utils/fileFieldUtils';

const { ApperFileUploader, ApperClient } = window.ApperSDK;

const ApperFile = ({ 
    label = "Files", 
    initialFiles = [], 
    onFilesChange = () => {}, 
    maxFiles = 50, 
    maxFileSize = 5 * 1024 * 1024 * 1024, // 5GB
    allowedTypes = ['pdf', 'jpg', 'png', 'doc', 'docx'],
    isRequired = false,
    error = null,
    disabled = false
}) => {
    const [apperClient, setApperClient] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [uploaderError, setUploaderError] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

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
                    apperBaseUrl: "https://api.apper.ai" // This was missing!
                };
                
                console.log('Initializing ApperClient with config:', clientConfig);
                
                const client = new ApperClient(clientConfig);
                setApperClient(client); // Store in state!
                setIsReady(true);
                
                console.log('✅ ApperClient initialized successfully');
                
            } catch (err) {
                console.error('❌ Failed to initialize ApperClient:', err);
                setError(`Initialization failed: ${err.message}`);
            }
        };

        initializeClient();
    }, []);
    // Initialize uploaded files from props (don't notify parent on initial load)
    useEffect(() => {
        if (initialFiles && Array.isArray(initialFiles)) {
            console.log('🔧 ApperFile - Initializing with initialFiles:', initialFiles);
            
            // Check if initialFiles are already in UI format or need conversion
            let formattedFiles;
            if (initialFiles.length > 0 && initialFiles[0].Id !== undefined) {
                // These are API format files, convert to UI format
                formattedFiles = FileFieldUtils.toUIFormat(initialFiles);
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
            
            console.log('🔧 ApperFile - Formatted initialFiles:', formattedFiles);
            
            setUploadedFiles(prevFiles => {
                // Only update if files have actually changed and prevent notification during initialization
                if (JSON.stringify(prevFiles) !== JSON.stringify(formattedFiles)) {
                    return formattedFiles;
                }
                return prevFiles;
            });
        }
    }, [initialFiles]);

    useEffect(() => {
        if (isReady && !disabled) {
            showUploader();
        }
    }, [isReady, disabled]);

    // Helper function to update files and notify parent
    const updateFiles = (newFiles) => {
        console.log('📁 ApperFile - updateFiles called with:', newFiles);
        setUploadedFiles(newFiles);
        // Use timeout to prevent setState during render
        setTimeout(() => {
            console.log('📁 ApperFile - About to call onFilesChange with:', newFiles);
            console.log('📁 ApperFile - onFilesChange type:', typeof onFilesChange);
            if (typeof onFilesChange === 'function') {
                onFilesChange(newFiles);
            }
        }, 0);
    };

    // Remove a file from the uploaded files
    const removeFile = (fileId) => {
        const newFiles = FileFieldUtils.removeFile(uploadedFiles, fileId);
        updateFiles(newFiles);
    };

    // Show file uploader UI
    const showUploader = async () => {
        if (!apperClient) {
            console.warn('ApperClient not ready yet!');
            return;
        }

        try {
            setUploaderError(null);
            console.log('🚀 Showing file uploader with client:', apperClient);

            const config = {
                // UI Configuration
                title: 'Upload',
                description: 'Select files to upload',
                allowMultiple: true, //value from the fields property
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
                
                // NEW: File state change callback
                onUploadedFilesChanged: (files) => {
                    console.log('📁 ApperFile - Files changed from uploader:', files);
                    console.log('📁 ApperFile - Files length:', files ? files.length : 'files is null/undefined');
                    console.log('📁 ApperFile - About to call updateFiles with:', files);
                    updateFiles(files);
                },
                
                // Event Callbacks
                onSuccess: (results) => {
                    console.log('✅ Upload successful:', results);
                    setIsUploading(false);
                    
                    // Note: File state updates are now primarily handled by onUploadedFilesChanged callback
                    // This ensures we always have the latest state from the uploader component
                },
                
                onError: (error) => {
                    console.error('❌ Upload failed:', error);
                    setIsUploading(false);
                    setUploaderError(error.message || 'Upload failed');
                },

                onProgress: (progress) => {
                    setIsUploading(true);
                    console.log('📊 Upload progress:', progress);
                }
            };

            console.log('📤 Config for showFileUploader:', config);
            console.log('📤 Config.onUploadedFilesChanged:', config.onUploadedFilesChanged);
            console.log('📤 Config.onUploadedFilesChanged type:', typeof config.onUploadedFilesChanged);
            console.log('🗂️ Current uploadedFiles when showing uploader:', uploadedFiles);

            // Mount the Vue component in React
            await ApperFileUploader.showFileUploader(
                'file-uploader-container',
                config
            );
            
            console.log('✅ File uploader UI mounted successfully');

        } catch (err) {
            console.error('❌ Failed to show uploader:', err);
            setUploaderError(`Failed to show uploader: ${err.message}`);
        }
    };

    // Reset uploader
    const resetUploader = () => {
        const container = document.getElementById('file-uploader-container');
        if (container) {
            container.innerHTML = '';
        }
        setUploaderError(null);
        updateFiles([]);
    };

    // Refresh uploader with current files
    const refreshUploader = async () => {
        if (isReady && !disabled) {
            console.log('🔄 Refreshing uploader with current files:', uploadedFiles);
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

            {/* Uploaded Files List */}
            {/* {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">
                        Uploaded Files ({uploadedFiles.length})
                    </div>
                    <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                            <div
                                key={file.id || file.name}
                                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
                                        <ApperIcon 
                                            name={FileFieldUtils.getFileIcon(file.type)} 
                                            className="w-4 h-4 text-slate-600" 
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {FileFieldUtils.formatFileSize(file.size)}
                                            {file.isNew && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {!disabled && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="X"
                                        onClick={() => removeFile(file.id)}
                                        className="text-slate-400 hover:text-red-500"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )} */}

            {/* Upload Status */}
            {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading files...</span>
                </div>
            )}

            {/* File Uploader Container */}
            <div 
                id="file-uploader-container"
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
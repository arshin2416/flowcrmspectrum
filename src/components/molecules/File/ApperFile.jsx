import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getFileIcon, convertFileSize } from '@/js/utils';

const { ApperFileUploader } = ApperSDK;

function ApperFile({
    modelValue = [],
    properties = null,
    multiple = false,
    variant = 'upload',
    buttonProperties = {
        variant: 'secondary',
        label: 'Upload'
    },
    files = { deleted: [], existing: [], new: [], hasDeleted: false },
    purpose = 'RecordAttachment',
    hasError = false,
    showNewUploadedFiles = true,
    attachmentLayout = 'block', // 'block' or 'inline'
    teleport = false,
    teleportTo = '#teleport-target',
    isExternalUser = true,
    // Event handlers
    onModelValueUpdate = () => {},
    onChange = () => {},
    onClick = () => {},
    onError = () => {},
    onWarning = () => {},
    onFileRemoved = () => {},
    onUploadComplete = () => {},
    onTeleportKeyDown = () => {}
}) {
    // State management
    const [newFiles, setNewFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [uploaderState, setUploaderState] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [isTeleported, setIsTeleported] = useState(false);
    const [teleportPosition, setTeleportPosition] = useState({});

    // Refs
    const uploadContainerRef = useRef(null);
    const teleportDropdownRef = useRef(null);
    const uploaderInstance = useRef(null);

    // Computed values
    const showExistingFiles = useMemo(() => {
        if (multiple) {
            return files.existing && files.existing.length > 0;
        } else {
            return files.new?.length === 0 ? files.existing && files.existing.length > 0 : false;
        }
    }, [multiple, files.existing, files.new]);

    const showAllFilesSection = useMemo(() => {
        const uploaderFilesCount = uploaderState.filesCount || 0;
        return uploaderFilesCount > 0 || (showExistingFiles && files.existing.length > 0);
    }, [uploaderState.filesCount, showExistingFiles, files.existing]);

    // Initialize existing files from modelValue
    const initializeExistingFiles = useCallback(() => {
    
        if (modelValue && Array.isArray(modelValue) && modelValue.length > 0) {
            const processedFiles = modelValue.map(existingFile => ({
                details: {
                    id: existingFile.Id,
                    icon: getFileIcon(existingFile.Name),
                    type: existingFile.Type,
                    name: existingFile.Name,
                    size: existingFile.Size,
                    parentRecordId: existingFile.ParentRecordId,
                    ordinal: existingFile.Ordinal,
                    path: existingFile.Path
                }
            }));
            setExistingFiles(processedFiles);
        }
    }, [modelValue]);

    // File uploader methods
    const fileUploaderMethods = {
        openFileInput: () => {
            if (uploaderInstance.current) {
                uploaderInstance.current.openFileInput();
            }
        },
        setFiles: (fileList) => {
            if (uploaderInstance.current) {
                uploaderInstance.current.setFiles(fileList);
            }
        },
        removeFile: (key) => {
            if (uploaderInstance.current) {
                uploaderInstance.current.removeFile(key);
            }
        },
        resetFiles: () => {
            if (uploaderInstance.current) {
                uploaderInstance.current.resetFiles();
            }
            setNewFiles([]);
        },
        uploadFiles: () => {
            if (uploaderInstance.current) {
                uploaderInstance.current.uploadFiles();
            }
        }
    };

    // Remove existing file
    const removeExistingFile = useCallback((event, index) => {
        if (index >= 0 && index < files.existing.length) {
            const file = files.existing[index];
            
            // Add to deleted array
            files.deleted.push({ Id: file.details.id });
            
            // Remove from existing array
            files.existing.splice(index, 1);
            
            // Update existing files state
            setExistingFiles([...files.existing]);
            
            // Trigger events
            onClick(event, { index, type: 'removed' });
            onFileRemoved(event, { file, index, type: 'existing' });
        }
    }, [files, onClick, onFileRemoved]);

    // Handle file change from uploader
    const handleFileChange = useCallback((event, data) => {
        console.log('Files changed:', data);
        const currentState = ApperFileUploader.getState();
        setUploaderState(currentState);
        
        // Extract files array
        const fileArray = [];
        if (currentState.files) {
            for (let key in currentState.files) {
                fileArray.push(currentState.files[key]);
            }
        }
        
        // Update new files
        setNewFiles(fileArray);
        files.new.length = 0;
        files.new.push(...fileArray);
        
        // Update model value with current files
        onModelValueUpdate(fileArray);
        onChange(event, data);
        
        // Handle teleport positioning
        if (teleport && !isTeleported && showAllFilesSection) {
            setIsTeleported(true);
            updateTeleportPosition();
        }
    }, [onModelValueUpdate, onChange, teleport, isTeleported, showAllFilesSection]);

    // Handle upload complete
    const handleUploadComplete = useCallback((event, data) => {
        console.log('Upload completed:', data);
        setIsUploading(false);
        setUploadError(null);
        
        // Get current state and extract completed files
        const currentState = ApperFileUploader.getState();
        const completedFiles = [];
        
        if (currentState.files) {
            for (let key in currentState.files) {
                const file = currentState.files[key];
                if (file.data?.isUploaded) {
                    completedFiles.push(file);
                }
            }
        }
        
        // Update model value with completed files
        onModelValueUpdate(completedFiles);
        onUploadComplete(event, { ...data, files: completedFiles });
        
        console.log('Completed files:', completedFiles);
        
    }, [onUploadComplete, onModelValueUpdate]);

    // Handle upload error
    const handleUploadError = useCallback((event, data) => {
        console.error('Upload error:', data);
        setUploadError(data.error || 'Upload failed');
        setIsUploading(false);
        onError(event, data);
    }, [onError]);

    // Handle upload warning
    const handleUploadWarning = useCallback((event, data) => {
        console.warn('Upload warning:', data);
        onWarning(event, data);
    }, [onWarning]);

    // Handle file removed
    const handleFileRemoved = useCallback((event, data) => {
        console.log('File removed:', data);
        const currentState = ApperFileUploader.getState();
        setUploaderState(currentState);
        
        // Update files arrays
        if (data.index >= 0 && data.index < files.new.length) {
            files.new.splice(data.index, 1);
            setNewFiles([...files.new]);
        }
        
        onFileRemoved(event, data);
    }, [files, onFileRemoved]);

    // Update teleport position
    const updateTeleportPosition = useCallback(() => {
        if (teleport && uploadContainerRef.current) {
            const rect = uploadContainerRef.current.getBoundingClientRect();
            setTeleportPosition({
                position: 'fixed',
                top: `${rect.bottom + 5}px`,
                left: `${rect.left}px`,
                zIndex: 1000
            });
        }
    }, [teleport]);

    // Initialize file uploader
    useEffect(() => {
        const initFileUploader = async () => {
      
            try {
                const options = {
                    purpose: purpose,
                    multiple: multiple,
                    properties: {
                        maxSize: properties?.maxSize || 5000000, // 5MB
                        extensions: properties?.extensions || 'jpg,png,pdf,doc,docx',
                        auto: properties?.auto !== undefined ? properties.auto : true,
                        showUploadedFiles: showNewUploadedFiles,
                        disabled: properties?.disabled || false,
                        ...properties
                    },
                    showUploadedFiles: showNewUploadedFiles,
                    variant: variant,
                    projectId: import.meta.env.VITE_APPER_PROJECT_ID,
                    isExternalUser: isExternalUser,
                    buttonProperties: buttonProperties
                };

                // Initialize the uploader
                const instance = await ApperFileUploader.showFileUpload('#file-upload-container', options);
                console.log('instance:', instance);

                uploaderInstance.current = instance;

                // Set up event listeners
                ApperFileUploader.onFileChange(handleFileChange);
                ApperFileUploader.onUploadComplete(handleUploadComplete);
                ApperFileUploader.onFileError(handleUploadError);
                ApperFileUploader.onFileWarning(handleUploadWarning);
                ApperFileUploader.onFileRemoved(handleFileRemoved);

                // Initialize state
                const initialState = ApperFileUploader.getState();
                setUploaderState(initialState);

            } catch (error) {
                console.error('Failed to initialize file uploader:', error);
                setUploadError('Failed to initialize file uploader');
                onError('init', { error: error.message });
            }
        };

        initFileUploader();

        // Cleanup on unmount
        return () => {
            ApperFileUploader.unmount();
        };
    }, []);

    // Initialize existing files
    useEffect(() => {
        initializeExistingFiles();
    }, [initializeExistingFiles]);

    // Handle teleport positioning
    useEffect(() => {
        if (teleport && showAllFilesSection) {
            setIsTeleported(true);
            updateTeleportPosition();
            
            // Add resize listener
            window.addEventListener('resize', updateTeleportPosition);
            return () => window.removeEventListener('resize', updateTeleportPosition);
        }
    }, [teleport, showAllFilesSection, updateTeleportPosition]);

    // Render file item
    const renderFileItem = (file, fileKey, isNew = false) => {
        const isInline = attachmentLayout === 'inline';
        const fileDetails = file.details || {};
        const fileData = file.data || {};

        return (
            <div 
                key={fileKey}
                className={`
                    uploadedFileListItem relative items-center p-1
                    ${isInline ? 'inline-flex rounded-md border border-gray-300 bg-white' : 'flex'}
                `}
            >
                <span className="flex w-full items-center gap-2">
                    {fileDetails.icon && (
                        <div className="w-6 h-6 flex items-center justify-center">
                            📄 {/* File icon - replace with actual icon component */}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                            {fileData.isFailed && (
                                <span className="text-red-500">❌</span>
                            )}
                            {fileData.isUploaded && (
                                <span className="text-green-500">✅</span>
                            )}
                            <span 
                                className={`
                                    max-w-[150px] truncate text-xs
                                    ${fileData.isFailed ? 'text-red-500' : ''}
                                    ${fileData.isUploaded ? 'font-semibold' : ''}
                                `}
                            >
                                {fileDetails.name}
                            </span>
                        </span>
                        <span className="text-xs text-gray-500">
                            {fileData.sizeText || convertFileSize(fileDetails.size)}
                        </span>
                    </div>
                </span>
                <button
                    className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                    onClick={() => isNew ? fileUploaderMethods.removeFile(fileKey) : null}
                    disabled={properties?.disabled}
                >
                    ✕
                </button>
                {fileData.isUploadInProgress && (
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="w-full bg-gray-200 h-1">
                            <div 
                                className="bg-blue-500 h-1 transition-all duration-300"
                                style={{ width: `${fileData.progress || 0}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render existing file item
    const renderExistingFileItem = (file, fileIndex) => {
        const isInline = attachmentLayout === 'inline';
        const fileDetails = file.details || {};

        return (
            <div 
                key={fileIndex}
                className={`
                    group flex items-center
                    ${isInline ? 'inline-flex rounded-md border border-gray-300 bg-white p-1' : 'mb-1'}
                `}
            >
                <span className="flex w-full items-center gap-3">
                    {fileDetails.icon && (
                        <div className="w-6 h-6 flex items-center justify-center">
                            📄 {/* File icon - replace with actual icon component */}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span 
                            className="max-w-28 truncate text-xs" 
                            title={fileDetails.name}
                        >
                            {fileDetails.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {convertFileSize(fileDetails.size)}
                        </span>
                    </div>
                </span>
                <span className="invisible group-hover:visible">
                    <button
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                        onClick={(event) => removeExistingFile(event, fileIndex)}
                        disabled={properties?.disabled}
                    >
                        🗑️
                    </button>
                </span>
            </div>
        );
    };

    // Render files section
    const renderFilesSection = () => {
        if (!showAllFilesSection) return null;

        const filesContainer = (
            <div
                ref={teleportDropdownRef}
                className={`
                    aprExisitngFilesContainer
                    ${attachmentLayout === 'inline' ? 'flex items-center gap-1' : ''}
                    ${teleport ? 'fixed max-h-64 min-w-60 overflow-auto rounded-lg border border-gray-300 bg-white p-4 shadow-lg scrollbar-thin' : ''}
                `}
                style={teleport ? teleportPosition : {}}
                tabIndex="0"
                onKeyDown={onTeleportKeyDown}
            >
                {/* New uploaded files */}
                {!showNewUploadedFiles && uploaderState.filesCount > 0 && (
                    <div className={`uploadedFileList flex flex-wrap gap-1 ${attachmentLayout === 'block' ? 'flex-col' : ''}`}>
                        {uploaderState.files && Object.entries(uploaderState.files).map(([fileKey, file]) => 
                            renderFileItem(file, fileKey, true)
                        )}
                    </div>
                )}

                {/* Existing files */}
                {showExistingFiles && (
                    <div className={`
                        flex flex-wrap gap-1
                        ${attachmentLayout === 'block' ? 'flex-col' : ''}
                        ${attachmentLayout === 'inline' ? 'mt-1' : ''}
                    `}>
                        {files.existing.map((file, fileIndex) => 
                            renderExistingFileItem(file, fileIndex)
                        )}
                    </div>
                )}
            </div>
        );

        // Handle teleport
        if (teleport && isTeleported) {
            return (
                <div>
                    {filesContainer}
                </div>
            );
        }

        return filesContainer;
    };

    return (
        <div className="apper-file-wrapper">
            {/* Error display */}
            {(uploadError || hasError) && (
                <div className="error-message text-red-600 mb-2 p-2 bg-red-50 rounded">
                    Error: {uploadError || 'Upload error occurred'}
                </div>
            )}

            
            {/* File upload container */}
            <div 
                id="file-upload-container" 
                ref={uploadContainerRef}
                className="w-full min-h-[100px]"
            />
            
            {/* Files section */}
            {renderFilesSection()}

        </div>
    );
}

export default ApperFile;
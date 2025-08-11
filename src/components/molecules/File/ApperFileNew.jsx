import React, { useState, useEffect } from 'react';
const { ApperFileUploader, ApperClient } = ApperSDK;

const ApperFileNew = () => {
    const [apperClient, setApperClient] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

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
    useEffect(() => {
        if (isReady) {
            showUploader();
        }
    }, [isReady]);  

    // Show file uploader UI
    const showUploader = async () => {
        if (!apperClient) {
            alert('ApperClient not ready yet!');
            return;
        }

        try {
            setError(null);
            console.log('🚀 Showing file uploader with client:', apperClient);

            const config = {
                // UI Configuration
                title: 'Upload',
                description: 'Select files to upload',
                allowMultiple: true,
                maxFiles: 5,
                maxFileSize: 5 * 1024 * 1024 * 1024 , // 5GB
                allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
                showRestrictions: true,
                autoUpload: true,
                
                // Upload Configuration
                uploadConfig: {
                    // For INTERNAL usage (with canvas)
                    canvasUniqueId: '600c31700dfe4ae88009ac4c221f5d83',
                    purpose: 'RecordAttachment',
                    isExternal: false, // FIXED: false for internal usage
                    
                    apperClient: apperClient,
                },
                
                // apperClient: apperClient,
                
                // Event Callbacks
                onSuccess: (results) => {
                    console.log('✅ Upload successful:', results);
                    alert(`Success! ${results.successCount} files uploaded!`);
                },
                
                onError: (error) => {
                    console.error('❌ Upload failed:', error);
                    setError(error.message || 'Upload failed');
                    alert(`Upload failed: ${error.message || error}`);
                }
            };

            console.log('📤 Config for showFileUploader:', config);

            // Mount the Vue component in React
            await ApperFileUploader.showFileUploader(
                'file-uploader-container',
                config
            );
            
            console.log('✅ File uploader UI mounted successfully');

        } catch (err) {
            console.error('❌ Failed to show uploader:', err);
            setError(`Failed to show uploader: ${err.message}`);
        }
    };

    // Alternative: External upload example
    const showExternalUploader = async () => {
        if (!apperClient) {
            alert('ApperClient not ready yet!');
            return;
        }

        try {
            const config = {
                title: 'External Upload',
                description: 'Upload files without canvas association',
                allowMultiple: false,
                maxFiles: 1,
                maxFileSize: 5 * 1024 * 1024, // 5MB
                allowedTypes: ['pdf', 'jpg', 'png'],
                
                uploadConfig: {
                    // For EXTERNAL usage (no canvas)
                    purpose: 'General',
                    isExternal: true, // External usage
                    // Note: no canvasUniqueId for external usage
                    metadata: {
                        source: 'react-external',
                        type: 'general'
                    }
                },
                
                apperClient: apperClient,
                
                onSuccess: (results) => {
                    console.log('✅ External upload successful:', results);
                    alert('External upload completed!');
                },
                
                onError: (error) => {
                    console.error('❌ External upload failed:', error);
                    alert(`External upload failed: ${error.message}`);
                }
            };

            // Clear container first
            const container = document.getElementById('file-uploader-container');
            if (container) {
                container.innerHTML = '';
            }

            await ApperFileUploader.showFileUploader(
                'file-uploader-container',
                config
            );

        } catch (err) {
            console.error('❌ Failed to show external uploader:', err);
            setError(`Failed to show external uploader: ${err.message}`);
        }
    };

    // Reset uploader
    const resetUploader = () => {
        const container = document.getElementById('file-uploader-container');
        if (container) {
            container.innerHTML = '';
        }
        setError(null);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* <h1>🚀 React File Uploader </h1> */}
            
            {/* Status Display */}
            {/* <div style={{
                padding: '15px',
                margin: '10px 0',
                borderRadius: '6px',
                backgroundColor: isReady ? '#d4edda' : '#fff3cd',
                border: `1px solid ${isReady ? '#c3e6cb' : '#ffeaa7'}`,
                color: isReady ? '#155724' : '#856404'
            }}>
                <strong>Status:</strong> {
                    !isReady ? '⏳ Initializing ApperClient...' :
                    '✅ Ready to upload files'
                }
                {apperClient && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Project ID: {apperClient.apperProjectId}
                    </div>
                )}
            </div> */}

            {/* Error Display */}
            {/* {error && (
                <div style={{
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '6px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    color: '#721c24'
                }}>
                    <strong>❌ Error:</strong> {error}
                </div>
            )} */}
            
            {/* Controls */}
            {/* <div style={{ margin: '20px 0' }}>
                <button 
                    onClick={showUploader}
                    disabled={!isReady}
                    style={{
                        backgroundColor: isReady ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: isReady ? 'pointer' : 'not-allowed',
                        marginRight: '10px',
                        fontSize: '14px'
                    }}
                >
                    📤 Show  Uploader
                </button>

              
            </div> */}

            {/* Container where Vue component will mount */}
            <div 
                id="file-uploader-container"
                // style={{
                //     marginTop: '20px',
                //     minHeight: '300px',
                //     border: '2px dashed #dee2e6',
                //     borderRadius: '8px',
                //     position: 'relative'
                // }}
            >
                {!isReady && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '300px',
                        color: '#6c757d',
                        fontSize: '16px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ marginBottom: '10px' }}>⏳</div>
                            <div>Initializing SDK...</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Debug Information */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '14px'
            }}>
             
            </div>
        </div>
    );
};

export default ApperFileNew;

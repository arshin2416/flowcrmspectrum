import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const FILE_ACTIONS = {
  INITIALIZE_FIELD: 'INITIALIZE_FIELD',
  UPDATE_FILES: 'UPDATE_FILES',
  CLEAR_FIELD: 'CLEAR_FIELD',
  CLEAR_ALL: 'CLEAR_ALL',
  SET_UPLOADING: 'SET_UPLOADING',
  SET_ERROR: 'SET_ERROR'
};

// Initial state
const initialState = {
  fileFields: {}, // { fieldId: { files: [], isUploading: false, error: null } }
};

// Reducer function
const fileReducer = (state, action) => {
  switch (action.type) {
    case FILE_ACTIONS.INITIALIZE_FIELD:
      return {
        ...state,
        fileFields: {
          ...state.fileFields,
          [action.payload.fieldId]: {
            files: action.payload.initialFiles || [],
            isUploading: false,
            error: null
          }
        }
      };

    case FILE_ACTIONS.UPDATE_FILES:
      return {
        ...state,
        fileFields: {
          ...state.fileFields,
          [action.payload.fieldId]: {
            ...state.fileFields[action.payload.fieldId],
            files: action.payload.files,
            error: null
          }
        }
      };

    case FILE_ACTIONS.CLEAR_FIELD:
      return {
        ...state,
        fileFields: {
          ...state.fileFields,
          [action.payload.fieldId]: {
            ...state.fileFields[action.payload.fieldId],
            files: [],
            error: null
          }
        }
      };

    case FILE_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        fileFields: Object.keys(state.fileFields).reduce((acc, fieldId) => {
          acc[fieldId] = {
            ...state.fileFields[fieldId],
            files: [],
            error: null
          };
          return acc;
        }, {})
      };

    case FILE_ACTIONS.SET_UPLOADING:
      return {
        ...state,
        fileFields: {
          ...state.fileFields,
          [action.payload.fieldId]: {
            ...state.fileFields[action.payload.fieldId],
            isUploading: action.payload.isUploading
          }
        }
      };

    case FILE_ACTIONS.SET_ERROR:
      return {
        ...state,
        fileFields: {
          ...state.fileFields,
          [action.payload.fieldId]: {
            ...state.fileFields[action.payload.fieldId],
            error: action.payload.error,
            isUploading: false
          }
        }
      };

    default:
      return state;
  }
};

// Create context
const FileContext = createContext();

// Provider component
export const FileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  // Initialize a file field
  const initializeField = useCallback((fieldId, initialFiles = []) => {
    dispatch({
      type: FILE_ACTIONS.INITIALIZE_FIELD,
      payload: { fieldId, initialFiles }
    });
  }, []);

  // Update files for a specific field
  const updateFiles = useCallback((fieldId, files) => {
    dispatch({
      type: FILE_ACTIONS.UPDATE_FILES,
      payload: { fieldId, files }
    });
  }, []);

  // Clear files for a specific field
  const clearField = useCallback((fieldId) => {
    dispatch({
      type: FILE_ACTIONS.CLEAR_FIELD,
      payload: { fieldId }
    });
  }, []);

  // Clear all file fields
  const clearAllFields = useCallback(() => {
    dispatch({
      type: FILE_ACTIONS.CLEAR_ALL
    });
  }, []);

  // Set uploading state for a field
  const setUploading = useCallback((fieldId, isUploading) => {
    dispatch({
      type: FILE_ACTIONS.SET_UPLOADING,
      payload: { fieldId, isUploading }
    });
  }, []);

  // Set error for a field
  const setError = useCallback((fieldId, error) => {
    dispatch({
      type: FILE_ACTIONS.SET_ERROR,
      payload: { fieldId, error }
    });
  }, []);

  // Get files for a specific field
  const getFieldFiles = useCallback((fieldId) => {
    return state.fileFields[fieldId]?.files || [];
  }, [state.fileFields]);

  // Get field state
  const getFieldState = useCallback((fieldId) => {
    return state.fileFields[fieldId] || { files: [], isUploading: false, error: null };
  }, [state.fileFields]);

  // Get all files as an object with field IDs as keys
  const getAllFiles = useCallback(() => {
    const result = {};
    Object.keys(state.fileFields).forEach(fieldId => {
      result[fieldId] = state.fileFields[fieldId].files;
    });
    return result;
  }, [state.fileFields]);

  // Check if any field is uploading
  const isAnyFieldUploading = useCallback(() => {
    return Object.values(state.fileFields).some(field => field.isUploading);
  }, [state.fileFields]);

  const contextValue = {
    // State
    fileFields: state.fileFields,
    
    // Actions
    initializeField,
    updateFiles,
    clearField,
    clearAllFields,
    setUploading,
    setError,
    
    // Getters
    getFieldFiles,
    getFieldState,
    getAllFiles,
    isAnyFieldUploading
  };

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to use the file context
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

// Export action types for reference
export { FILE_ACTIONS };

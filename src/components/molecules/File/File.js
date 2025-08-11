import { ref, reactive, onMounted, computed } from 'vue';

import { getFileIcon, convertFileSize } from '@companyhub-ig/slate-ui-framework/js/utils/File';

import { Events } from '@companyhub-ig/slate-ui-framework/js/Events';

import { useTeleport } from '@companyhub-ig/slate-ui-framework/composables/Teleport';
import { waitForDelay } from '@companyhub-ig/slate-ui-framework/js/Utils';

export default {
    emits: ['update:modelValue', 'change', 'click', 'error', 'warning', 'file-removed', 'upload-complete', 'teleport-keydown'],
    props: {
        modelValue: {
            type: Array,
            default: []
        },
        properties: {
            type: Object,
            default: null
        },
        multiple: {
            type: [Boolean, String],
            default: false
        },
        variant: {
            type: String,
            default: 'upload'
        },
        buttonProperties: {
            type: Object,
            default: {
                variant: 'secondary',
                label: 'Upload'
            }
        },
        files: {
            type: Object,
            default: { deleted: [], existing: [], new: [], hasDeleted: false }
        },
        signatureApi: {
            type: String,
            required: true,
            default: null
        },
        purpose: {
            type: String,
            isReuired: true,
            default: 'RecordAttachment'
        },
        hasError: {
            type: Boolean,
            default: false
        },
        showNewUploadedFiles: {
            type: Boolean,
            default: true
        },
        attachmentLayout: {
            type: String,
            default: 'block'
        },
        teleport: {
            type: Boolean,
            default: false
        },
        teleportTo: {
            type: String,
            default: '#teleport-target'
        }
    },
    setup(props, { emit }) {
        let events = new Events(emit);

        const TeleportDropdown = useTeleport(props);

        let fileEvents = {
            onError(event, data) {
                emit('error', event, data);
            },
            onWarning(event, data) {
                emit('warning', event, data);
            },
            onFileRemoved(event, data) {
                emit('file-removed', event, data);
            },
            onUploadComplete(event, data) {
                emit('upload-complete', event, data);
            }
        };

        //events = { ...events, ...fileEvents };

        const existingFiles = reactive(getExistingFiles());

        var newFiles = reactive(getExistingFiles());

        const fileUploadRef = ref(null);

        const UI = reactive({
            isTeleported: false
        });

        const showExistingFiles = computed(() => {
            if (props.multiple) {
                return props.files.existing && props.files.existing.length > 0;
            } else {
                return props.files.new?.length == 0 ? props.files.existing && props.files.existing.length > 0 : false;
            }
        });

        const showAllFilesSection = computed(() => {
            return fileUploadRef.value?.variables.filesCount > 0 || (showExistingFiles.value && props.files.existing.length > 0);
        });

        onMounted(async () => {
            if (props.teleport) {
                await waitForDelay(10);

                if (showAllFilesSection.value) {
                    UI.isTeleported = true;
                    TeleportDropdown.updateDropdownPosition();
                }
            }
        });

        function getExistingFiles() {
            let files = [];

            if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
                for (let i = 0; i < props.modelValue.length; i++) {
                    let existingFile = props.modelValue[i];
                    
                    let file = {
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
                    };

                    files.push(file);
                }
            }

            return files;
        }

        const methods = {
            openFileInput() {
                fileUploadRef.value.methods.openFileInput();
            },
            setFiles(files) {
                fileUploadRef.value.methods.setFiles(files);
            },
            removeFile(key) {
                fileUploadRef.value.methods.removeFile(key);
            },
            resetFiles() {
                fileUploadRef.value.methods.resetFiles();
            },
            uploadFiles() {
                fileUploadRef.value.methods.uploadFiles();
            },
            removeExistingFile(event, index) {
                if (index >= 0 && index < props.files.existing.length) {
                    let file = props.files.existing[index];

                    props.files.deleted.push({ Id: file.details.Id });

                    props.files.existing.splice(index, 1);

                    events.onClick(event, { index: index, type: 'removed' });
                }
            }
        };

        const actions = {
            onFileRemoved(event, data) {
                fileEvents.onFileRemoved(event, data);

                props.files.new.splice(data.index, 1);
            },
            convertFileSize(size) {
                return convertFileSize(size);
            }
        };

        function onChange(e) {
            newFiles = e;

            let files = [];

            let selectedFiles = fileUploadRef.value.variables.files;

            for (let key in selectedFiles) {
                let file = selectedFiles[key];
                files.push(file);
            }

            props.files.new.length = 0;
            props.files.new = files;

            updateModelValue(files);

            if (props.teleport && !UI.isTeleported) {
                if (showAllFilesSection.value) {
                    UI.isTeleported = true;
                    TeleportDropdown.updateDropdownPosition();
                }
            }
        }

        function updateModelValue(files) {
            emit('update:modelValue', files);
        }

        let availableEvents = ['update:modelValue', 'change', 'click', 'error', 'warning', 'file-removed'];

        return {
            //rootRef,
            actions,
            fileUploadRef,
            existingFiles,
            newFiles,
            onChange,
            showExistingFiles,
            methods,
            events,
            availableEvents,
            fileEvents,
            showAllFilesSection,
            ...TeleportDropdown
        };
    }
};

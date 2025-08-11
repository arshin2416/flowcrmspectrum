<template>
    <div ref="teleportRootRef">
        <SlateFileUpload
            ref="fileUploadRef"
            :signatureApi="signatureApi"
            :properties="properties"
            v-model="newFiles"
            :multiple="multiple"
            :variant="variant"
            :buttonProperties="buttonProperties"
            :purpose="purpose"
            :hasError="hasError"
            :showUploadedFiles="showNewUploadedFiles"
            @update:modelValue="onChange"
            @error="(e, d) => fileEvents.onError(e, d)"
            @warning="(e, d) => fileEvents.onWarning(e, d)"
            @file-removed="(e, d) => actions.onFileRemoved(e, d)"
            @upload-complete="(e, d) => fileEvents.onUploadComplete(e, d)"
        >
        </SlateFileUpload>
        <Transition enter-active-class="animate-bottom-to-top" leave-active-class="animate-top-to-bottom">
            <Teleport :disabled="!teleport" :to="teleportTo">
                <div
                    v-if="showAllFilesSection"
                    ref="teleportDropdownRef"
                    class="aprExisitngFilesContainer"
                    :class="[
                        { 'flex items-center gap-1': attachmentLayout == 'inline' },
                        teleport
                            ? 'fixed max-h-64 min-w-60 overflow-auto rounded-lg border border-skin-primary bg-skin-primary p-4 shadow-bottomRight scrollbar-thin'
                            : ''
                    ]"
                    :style="teleport ? teleportDropdownStyles : ''"
                    tabindex="0"
                    @keydown="events.onTeleportKeyDown"
                >
                    <template v-if="!showNewUploadedFiles && fileUploadRef?.variables.filesCount > 0">
                        <div class="uploadedFileList flex flex-wrap gap-1" :class="{ 'flex-col': attachmentLayout == 'block' }">
                            <div
                                v-for="(file, fileKey, fileIndex) in fileUploadRef?.variables?.files"
                                class="uploadedFileListItem relative items-center p-1"
                                :class="{
                                    'inline-flex rounded-md border border-skin-primary bg-white': attachmentLayout == 'inline',
                                    flex: attachmentLayout == 'block'
                                }"
                            >
                                <span class="flex w-full items-center gap-2">
                                    <SlateFileIcon v-if="file.details.icon" :icon="file.details.icon"></SlateFileIcon>
                                    <div class="flex flex-col">
                                        <span class="aprExisitngFileTxt flex items-center gap-1">
                                            <SlateIcon v-if="file.data.isFailed" icon="error" class="text-skin-error-primary" />
                                            <SlateIcon v-if="file.data.isUploaded" icon="check_circle" class="text-skin-success-primary"> </SlateIcon>
                                            <span
                                                class="aprExisitngFileName max-w-[150px] truncate text-xs"
                                                :class="{ 'text-skin-error-primary': file.data.isFailed, 'font-semibold': file.data.isUploaded }"
                                                >{{ file.details.name }}</span
                                            >
                                        </span>
                                        <span class="aprExisitngFileSize text-xs text-skin-tertiary">{{ file.data.sizeText }}</span>
                                    </div>
                                </span>
                                <SlateButton
                                    variant="tertiary"
                                    size="sm"
                                    rounded
                                    iconOnly
                                    left-icon="close"
                                    @click="methods.removeFile(fileKey, true)"
                                />
                                <div v-if="file.data.isUploadInProgress" class="absolute bottom-0 left-0 right-0">
                                    <SlateProgress v-if="file.data.isUploaded" :percentage="100"> </SlateProgress>
                                    <SlateProgress v-else :percentage="file.data.progress"> </SlateProgress>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div
                        v-if="showExistingFiles"
                        class="aprExisitngFileList flex flex-wrap gap-1"
                        :class="{ 'flex-col': attachmentLayout == 'block', 'mt-1': attachmentLayout == 'inline' }"
                    >
                        <template v-for="(file, fileIndex) in files.existing">
                            <div
                                class="aprExisitngFile group flex items-center"
                                :class="{
                                    'inline-flex rounded-md border border-skin-primary bg-white p-1 ': attachmentLayout == 'inline',
                                    'mb-1': attachmentLayout == 'block'
                                }"
                            >
                                <span class="flex w-full items-center gap-3">
                                    <SlateFileIcon v-if="file.details.icon" :icon="file.details.icon"></SlateFileIcon>
                                    <div class="aprExisitngFileTxt flex flex-col">
                                        <span class="aprExisitngFileName max-w-28 truncate text-xs" :title="file.details.Name">{{
                                            file.details.Name
                                        }}</span>
                                        <span class="aprExisitngFileSize text-xs text-skin-tertiary">{{
                                            actions.convertFileSize(file.details.Size)
                                        }}</span>
                                    </div>
                                </span>
                                <span class="invisible group-hover:visible">
                                    <SlateButton
                                        variant="tertiary"
                                        size="sm"
                                        rounded
                                        iconOnly
                                        left-icon="delete"
                                        @click="(event) => methods.removeExistingFile(event, fileIndex)"
                                        :disabled="properties?.disabled"
                                    />
                                </span>
                            </div>
                        </template>
                    </div>
                </div>
            </Teleport>
        </Transition>
    </div>
</template>

<script src="./File.js"></script>

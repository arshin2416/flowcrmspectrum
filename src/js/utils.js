const extensionIcons = {
    jpeg: ['jpeg'],
    jpg: ['jpg'],
    png: ['png'],
    gif: ['gif'],
    webp: ['webp'],
    svg: ['svg'],
    tiff: ['tiff'],
    pdf: ['pdf'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', '3gp', 'ogg', 'm4v', 'vob'],
    audio: ['mp3', 'wav'],
    docs: ['doc', 'docx'],
    html: ['html'],
    css: ['css'],
    default: ['rtf', 'odt', 'xml', 'json', 'log', 'md'],
    txt: ['txt'],
    sheet: ['xls', 'xlsx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'csv']
};

export function getFileExtension(fileName) {
    console.log(fileName);
    if (fileName) {
        return fileName.split('.').pop();
    }
    return ''   ;
}

export function getFileIcon(fileName) {
    let extension = getFileExtension(fileName);

    let iconEntries = Object.entries(extensionIcons);

    for (let [index, [key, value]] of iconEntries.entries()) {
        if (value.indexOf(extension) != -1) {
            return key;
        }
    }

    return '';
}

export function convertFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

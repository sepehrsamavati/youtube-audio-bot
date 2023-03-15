export type UITextObj = {
    _lang: string;
    _start: string;
    stats: string;
    help: string;
    random: string;
    top5: string;
    weekTop: string;
    mostLikes: string;
    recentDownloads: string;
    addAdmin: string;
    remAdmin: string;
    return: string,
    edtSup: string;
    submit: string;
    cancel: string;
    vidStats: string;
    on: string;
    off: string;
    ok: string;
    failed: string;
    noAccess: string;
    commandNotFound: string;
    invalidVideo: string;

    musicNotFound: string;
    liked: string;
    likeRemoved: string;

    botIsBusy: string;
    isBeingDownloaded: string;
    reachedConcurrentDownloads: string;

    currentAdmins: string;
    sendUserIdToAddAdmin: string;
    selectItemToRemove: string;

    share: string;
    alreadyLiked: string;
    isNotLiked: string;

    /* Download Steps */
    validating: string;
    getInfo: string;
    downloadVideo: string;
    convertToAudio: string;
    generateCover: string;
    upload: string;
    setMeta: string;

    /* Settings */
    settings: string;
    startText: string;
    helpText: string;
    publicMode: string;
    shareAvailable: string;

    /* Errors */
    convertError: string;
    fileSizeOver50: string;
    coverConvertError: string;
    coverCropError: string;
    croppedCoverSaveError: string;
    setCoverError: string;
    uploadError: string;
};

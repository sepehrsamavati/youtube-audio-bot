import { UITextObj } from "../types/uitext";

const UITextData: UITextObj[] = [
    {
        _lang: "en",
        _start: "🤟 Hi [NAME], welcome to YouTube Audio bot\n⁉ Help: /help",
        _help: "📌 Just send me a YouTube link or video ID to get MP3 file here",
        stats: "📊 Stats",
        help: "❔ Help",
        random: "🎲 Random song",
        top5: "🎖 Top 5",
        weekTop: "🥇 Last Week Top",
        mostLikes: "♥ Most Likes",
        recentDownloads: "🗂 Recent Downloads",
        addAdmin: "➕ Add admin",
        remAdmin: "➖ Remove admin",
        return: "🔙 Return",
        edtSup: "⚠️ Edited messages aren't supported.",
        submit: "✅ Submit",
        cancel: "❌ Cancel",
        vidStats: "📈 Week Downloads",
        on: "⚪ On",
        off: "⚫ Off",
        ok: "✅",
        failed: "❌",
        noAccess: "❌ You have no access!",
        commandNotFound: "❌ Command not found!",
        invalidVideo: "❌ Video is not valid!",
        musicNotFound: "Couldn't find music",
        liked: "Liked 💚",
        likeRemoved: "Like removed 💔",
        invalidCommand: "❌ Invalid command!",

        botIsBusy: "⚠️ Bot is too busy, wait a minute & try again.",
        isBeingDownloaded: "⚠️ Same video/audio is being downloaded, wait a minute & try again.",
        reachedConcurrentDownloads: "❌ You've reached concurrent downloads limit!",

        currentAdmins: "Current admins",
        selectItemToRemove: "Select item to remove",
        sendUserIdToAddAdmin: "Send Telegram ID to add admin",

        share: "Share",
        alreadyLiked: "❌ Already liked!",
        isNotLiked: "❌ Unable to remove like!",

        validating: "🔁 Validating...",
        getInfo: "ℹ️ [1/6] Getting info",
        downloadVideo: "📥 [2/6] Downloading MP4",
        convertToAudio: "🎙 [3/6] Converting to MP3",
        generateCover: "📸 [4/6] Generating cover",
        setMeta: "🖋 [5/6] Setting meta data",
        upload: "📤 [6/6] Uploading to Telegram",

        /* Settings */
        settings: "⚙️ Settings",
        startText: "📃 Start text",
        helpText: "❔ Help text",
        publicMode: "Public mode",
        shareAvailable: "Share",
        valueTurnedTo: "%s1 turned %s2",
        valueChangedTo: "%s1 changed to %s2",
        invalidValue: "%s1\n\n❌ Invalid value%s2",

        invalidDataFormat: "Invalid Format",
        convertError: "Error in converting",
        fileSizeOver50: "File size is over 50 MB",
        coverConvertError: "Couldn't convert cover",
        coverCropError: "Couldn't crop cover",
        croppedCoverSaveError: "Error while saving cropped cover",
        setCoverError: "Couldn't set cover",
        uploadError: "Couldn't upload audio!"
    }
];

export default UITextData;

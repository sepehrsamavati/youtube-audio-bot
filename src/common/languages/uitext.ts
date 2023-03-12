import { UITextObj } from "../types/uitext";

const UIText: UITextObj[] = [
    {
        _lang: "en",
        _start: "🤟 Hi [NAME], welcome to YouTube Audio bot\n⁉ Help: /help",
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

        share: "Share",
        alreadyLiked: "❌ Already liked!",
        isNotLiked: "❌ Unable to remove like!",

        getInfo: "ℹ️ [1/6] Getting info",
        downloadVideo: "📥 [2/6] Downloading MP4",
        convertToAudio: "🎙 [3/6] Converting to MP3",
        generateCover: "📸 [4/6] Generating cover",
        setMeta: "📤 [5/6] Setting meta data",
        upload: "📤 [7/6] Uploading to Telegram",

        /* Settings */
        settings: "⚙️ Settings",
        startText: "📃 Start text",
        helpText: "❔ Help text",
        publicMode: "Public mode",
        shareAvailable: "Share",

        convertError: "Error in converting",
        fileSizeOver50: "File size is over 50 MB",
        coverConvertError: "Couldn't convert cover",
        coverCropError: "Couldn't crop cover",
        croppedCoverSaveError: "Error while saving cropped cover",
        setCoverError: "Couldn't set cover",
    }
];

export default UIText;

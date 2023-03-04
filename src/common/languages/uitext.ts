import { UITextObj } from "../types/uitext";

const UIText: UITextObj[] = [
    {
        _lang: "en",
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

        downloadSteps: {
            getInfo: "ℹ️ [1/5] Getting info",
            downloadVideo: "📥 [2/5] Downloading MP4",
            convertToAudio: "🎙 [3/5] Converting to MP3",
            generateCover: "📸 [4/5] Generating cover",
            upload: "📤 [5/5] Uploading to Telegram"
        },

        /* Settings */
        settings: "⚙️ Settings",
        startText: "📃 Start text",
        helpText: "❔ Help text",
        publicMode: "Public mode",
        shareAvailable: "Share"
    }
];

export default UIText;

import { UITextObj } from "../types/uitext";

const UITextData: UITextObj[] = [
    {
        _lang: "en",
        _start: "🤟 Hi [NAME], welcome to YouTube Audio bot\n⁉ Help: /help",
        _help: "📌 Just send me a YouTube link or video ID to get MP3 file here",
        _notPromoted: "❌ You're not promoted and don't have access to use the bot",
        stats: "📊 Stats",
        _stats: "Bot statistics"
            + "\n\n📉 Total BCs: %s1"
            + "\n⏱ Last BC: %s2"
            + "\n\n📊 Last week downloads: %s3"
            + "\n🗃 Saved: %s4"
            + "\n👁 Views: %s5"
            + "\n\n👥 Users: %s6",
        help: "❔ Help",
        random: "🎲 Random song",
        top5: "🎖 Top 5",
        _top5: "🔥 Top %s1 download(s)\n\n\n%s2",
        weekTop: "🥇 Last Week Top",
        _weekTop: "🔥 Top %s1 last week download(s)\n\n\n%s2",
        mostLikes: "♥ Most Likes",
        _mostLikes: "♥ Top %s1 likes\n\n\n%s2",
        recentDownloads: "🗂 Recent Downloads",
        _recentDownloads: "📆 Recent %s1 Downloads\n\n\n%s2",
        noDownloads: "No downloads!",
        addAdmin: "➕ Add admin",
        remAdmin: "➖ Remove admin",
        return: "🔙 Return",
        edtSup: "⚠️ Edited messages aren't supported.",
        submit: "✅ Submit",
        cancel: "❌ Cancel",
        on: "⚪ On",
        off: "⚫ Off",
        ok: "✅",
        failed: "❌",
        never: "Never",
        noAccess: "❌ You have no access!",
        commandNotFound: "❌ Command not found!",
        invalidVideo: "❌ Video is not valid!",
        musicNotFound: "Couldn't find music",
        liked: "Liked 💚",
        likeRemoved: "Like removed 💔",
        invalidCommand: "❌ Invalid command!",
        setError: "Error in setting value!",
        currentValueSelectNew: "Current value: %s1\nSelect new value",
        currentValueSendNewMessage: "Current value:\n\n%s1\n\n\nSend new message",
        alreadyBanned: "Already banned",
        notBanned: "User isn't banned",
        cantBanYourself: "Can't ban yourself",
        userBanned: "User banned",
        userUnbanned: "User unbanned",

        sendingToUsers: "🔁 Sending to %s1 user(s)...",
        sentToUsers: "✅ Sent to %s1 user(s).",
        replyToMessageToBroadcast: "⚠️ Reply to a message to broadcast!",

        userAccountName: "User account name",
        userAccountInfo: "🆔 User %s1%s2\n\nStatus: %s3\nMode: %s4\nLanguage: %s5\nLast request: %s6\n%s7\n%s8",
        promotedBy: "Promoted by %s1",
        userNotFound: "❌ User not found",
        userIsNotAdmin: "❌ Not admin",
        adminAdded: "✅ Admin %s1 added",
        adminRemoved: "✅ Admin %s1 removed",
        cantRemoveOwner: "❌ Cannot remove owner",
        alreadyAdmin: "❌ Already admin",

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
        textLengthLimitError: "Text too large, max valid length is %s1",
        availableDynamicWords: "Available dynamic words:",

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

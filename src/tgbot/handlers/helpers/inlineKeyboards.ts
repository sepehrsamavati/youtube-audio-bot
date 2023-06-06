import config from "../../../config.js";
import settings from "../../../settings.js";
import { User } from "../../../common/types/user.js";
import { UITextObj } from "../../../common/types/uitext.js";
import { UserType } from "../../../common/enums/user.enum.js";

export default {
    admin: (admin: User, UIT: UITextObj) => {
        const keyboard = [
            [{ text: UIT.stats }, { text: UIT.settings }]
        ];
        if (admin && config.owners.includes(admin.tgId)) {
            keyboard.push([{ text: UIT.addAdmin }, { text: UIT.remAdmin }]);
        }
        keyboard.push([{ text: UIT.userPanel }]);
        return {
            keyboard,
            resize_keyboard: true
        };
    },
    user: (user: User, UIT: UITextObj) => {
        const keyboard = [
            [{ text: UIT.random }, { text: UIT.weekTop }],
            [{ text: UIT.recentDownloads }],
            [{ text: UIT.top5 }, { text: UIT.mostLikes }],
            [{ text: UIT.help }]
        ];
        if(user.type === UserType.Admin)
            keyboard.push([{ text: UIT.adminPanel }]);
        return {
            keyboard,
            resize_keyboard: true
        };
    },
    return: (UIT: UITextObj) => {
        return {
            keyboard: [[{ text: UIT.return }]],
            resize_keyboard: true,
            one_time_keyboard: true
        };
    },
    cancel: (UIT: UITextObj) => {
        return {
            keyboard: [[{ text: UIT.cancel }]],
            resize_keyboard: true,
            one_time_keyboard: true
        };
    },
    create: (rows: string[][]) => {
        return {
            keyboard: rows.map(row => row.map(button => {
                return { text: button };
            })),
            resize_keyboard: true,
            one_time_keyboard: true
        };
    },
    audio: {
        normal: (audio: AudioViewModel | string, UIT: UITextObj) => {
            let id = "", isLiked = false;
            if (typeof audio === "string") {
                id = audio;
                isLiked = false;
            } else {
                id = audio.vid;
                isLiked = audio.isLiked;
            }
            const likeQuery = isLiked ? `remLike${id}` : `like${id}`;
            const inlineKeyboard: any[] = [
                { text: isLiked ? "💚" : "♥", callback_data: likeQuery }
            ];
            if(settings.shareAvailable && !settings.protectAudios) {
                inlineKeyboard.push({ text: UIT.share, switch_inline_query: `getVid${id}` });
            }
            return {
                inline_keyboard: [inlineKeyboard]
            };
        }
    }
};

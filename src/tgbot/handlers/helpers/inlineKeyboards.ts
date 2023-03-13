import { UITextObj } from "../../../common/types/uitext.js";
import { User } from "../../../common/types/user.js";
import config from "../../../config.js";

export default {
    admin: (admin: User, UIT: UITextObj) => {
        let keyboard = [
            [{ text: UIT.stats }, { text: UIT.settings }],
            [{ text: UIT.vidStats }]
        ];
        if (admin && config.owners.includes(admin.tgId)) {
            keyboard.splice(3, 0, [{ text: UIT.addAdmin }, { text: UIT.remAdmin }]);
        }
        return keyboard;
    },
    user: (user: User, UIT: UITextObj) => {
        return [
            [{ text: UIT.random }, { text: UIT.weekTop }],
            [{ text: UIT.recentDownloads }],
            [{ text: UIT.top5 }, { text: UIT.mostLikes }],
            [{ text: UIT.help }]
        ];
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
            const likeQuery = `like${id}`;
            return {
                inline_keyboard: [
                    [
                        { text: isLiked ? "💚" : "♥", callback_data: likeQuery },
                        { text: UIT.share, switch_inline_query: `getVid${id}` }
                    ]
                ]
            };
        }
    }
};

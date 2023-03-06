import { UserStatus } from "../../../common/enums/user.enum.js";
import { UITextObj } from "../../../common/types/uitext.js";

export default {
    admin: (admin: User, UIT: UITextObj) => {
        let keyboard = [
            [{ text: UIT.stats }, { text: UIT.settings }],
            [{ text: UIT.vidStats }]
        ];
        if (admin && admin.status === UserStatus.Owner) {
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
    }
};

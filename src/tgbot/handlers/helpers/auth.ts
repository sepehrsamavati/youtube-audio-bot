import { User } from "../../../common/types/user.js";
import { ChatID } from "../../../common/types/tgBot.js";
import UserApplication from "../../../application/user.application.js";

const cache: any = {};

const findUser = async (userApplication: UserApplication, id: ChatID): Promise<User | undefined> => {
    let user: User | undefined;
    if(!user)
    {
        const dbUser = await userApplication.getByTgId(id, true, true);
        if(dbUser)
        {
            user = cache[id] = dbUser;
            cache[id].transferLock = false;
        }
    }
    return user;
};

const updateCache = (id: ChatID, newData: User) => {
    if(cache[id])
        cache[id] = {...newData};
};

export {
    findUser,
    updateCache
};

import { ChatID } from "../../../common/interfaces/tgBot.interface.js";
import UserApplication from "../../../application/user.application";
import UserRepository from "../../../infrastructure/mongo/repository/userRepository";

const cache: any = {};

const userRepository = new UserRepository();
const userApplication = new UserApplication(userRepository);

const findUser = async (id: ChatID): Promise<User | undefined> => {
    let user: User | undefined = cache[id];
    if(!user)
    {
        const dbUser = await userApplication.getByTgId(id);
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

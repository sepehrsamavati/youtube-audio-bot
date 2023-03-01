import UserRepository from "../infrastructure/mongo/repository/userRepository";
import IUserApplication from "./contracts/user/application.interface";

export default class UserApplication implements IUserApplication {
    constructor(
        private userRepository: UserRepository
    ){}

    async getByTgId(id: number): Promise<User | null> {
        let user = await this.userRepository.findByTgId(id);
        return user;
    }
};

export default interface IUserRepository {
    createUser(tgId: number): Promise<User | null>;
    findByTgId(id: number): Promise<User | null>;
}

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
}

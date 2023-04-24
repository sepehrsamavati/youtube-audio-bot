export default interface ISettingsRepository {
    add(settings: Setting[]): Promise<boolean>;
    update(setting: Setting): Promise<boolean>;
    get(key: string): Promise<Setting | null>;
    getAll(): Promise<Setting[] | null>;
    getValue(key: string): Promise<string | null>;
}

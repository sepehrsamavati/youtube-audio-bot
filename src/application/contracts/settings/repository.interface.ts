export default interface ISettingsRepository {
    add(settings: Setting[]): Promise<boolean>;
    update(key: string, value: string): Promise<boolean>;
    get(key: string): Promise<Setting | null>;
    getValue(key: string): Promise<string | null>;
}

export enum UserMode {
    /* Shared */
    Default = 1,

    /* Admin */
    AddAdmin = 20,
    RemoveAdmin = 21,

    /* Settings */
    AdminSettings = 30,
    SetStartText = 31,
    SetHelpText = 32,
}

export enum UserStatus {
    Temp = 0,
    OK = 1,
    Blocked = 3,
    Banned = 4
}

export enum UserType {
    Default = 1,
    Admin = 2
}

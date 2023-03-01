type User = {
    tgId: number;
    mode: UserMode;
    status: UserStatus;
    downloads: number;
    usage: {
        up: number;
        down: number;
    };
    lastRequest: Date;
}
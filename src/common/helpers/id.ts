const newLocalVideoID = (vid: string) => `YTD-I${Math.random().toString(36).substring(2).slice(-2)}D-${vid}`;

export {
    newLocalVideoID
};
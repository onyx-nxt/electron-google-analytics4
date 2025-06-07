declare class Analytics4 {
    private trackingID;
    private secretKey;
    private clientID;
    private userID;
    private sessionID;
    private customParams;
    private userProperties;
    private baseURL;
    private collectURL;
    constructor(trackingID: string, secretKey: string, clientID: string | undefined, userID: string, sessionID?: string);
    set(key: string, value: any): this;
    setParams(params?: Record<string, unknown>): this;
    setUserProperties(upValue?: Record<string, unknown>): this;
    event(eventName: string): Promise<string>;
}
export default Analytics4;

import {v4 as uuidv4} from 'uuid';

class Analytics4 {
    private trackingID: string;
    private secretKey: string;
    private clientID: string;
	private userID: string;
	private userIP: string;
    private sessionID: string;
	private debug: boolean;
    private customParams: Record<string, unknown> = {};
    private userProperties: Record<string, unknown> | null = null;

    private baseURL = 'https://google-analytics.com/mp';
    private collectURL = '/collect';

    constructor(trackingID: string, secretKey: string, clientID: string = uuidv4(), userID: string, userIP: string, sessionID = uuidv4(), debug: boolean) {
        this.trackingID = trackingID;
        this.secretKey = secretKey;
        this.clientID = clientID;
		this.userID = userID;
        this.sessionID = sessionID;
		this.userIP = userIP;
		this.debug = debug;
    }

    set(key: string, value: any) {
        if (value !== null) {
            this.customParams[key] = value;
        } else {
            delete this.customParams[key];
        }

        return this;
    }

    setParams(params?: Record<string, unknown>) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
            Object.assign(this.customParams, params)
        } else {
            this.customParams = {};
        }

        return this;
    }

    setUserProperties(upValue?: Record<string, unknown>) {
        if (typeof upValue === 'object' && Object.keys(upValue).length > 0) {
            this.userProperties = upValue;
        } else {
            this.userProperties = null;
        }

        return this;
    }

    async event(eventName: string): Promise<string> {
        const payload = {
            client_id: this.clientID,
			user_id: this?.userID,
			ip_override: this?.userIP,
            events: [
                {
                    name: eventName,
                    params: {
                        session_id: this.sessionID,
						debug_mode: this?.debug,
                        ...this.customParams,
                    },
                },
            ],
        };
        if (this.userProperties) {
            Object.assign(payload, { user_properties: this.userProperties });
        }

		// Ensure page_title persists across events
		this.customParams = (({ page_title }) => ({ page_title }))(this.customParams);

		const url = `${this.baseURL}${this.collectURL}?measurement_id=${this.trackingID}&api_secret=${this.secretKey}`;

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			return await response.text();
		} catch (error) {
			if (error instanceof Error) {
                throw new Error(`Error sending GA event: ${error.message}`);
            }
            throw new Error('Unknown error sending GA event');
		}
    }
}

export default Analytics4;

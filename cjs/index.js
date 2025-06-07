"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Analytics4 {
    trackingID;
    secretKey;
    clientID;
    userID;
    sessionID;
    customParams = {};
    userProperties = null;
    baseURL = 'https://google-analytics.com/mp';
    collectURL = '/collect';
    constructor(trackingID, secretKey, clientID = (0, uuid_1.v4)(), userID, sessionID = (0, uuid_1.v4)()) {
        this.trackingID = trackingID;
        this.secretKey = secretKey;
        this.clientID = clientID;
        this.userID = userID;
        this.sessionID = sessionID;
    }
    set(key, value) {
        if (value !== null) {
            this.customParams[key] = value;
        }
        else {
            delete this.customParams[key];
        }
        return this;
    }
    setParams(params) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
            Object.assign(this.customParams, params);
        }
        else {
            this.customParams = {};
        }
        return this;
    }
    setUserProperties(upValue) {
        if (typeof upValue === 'object' && Object.keys(upValue).length > 0) {
            this.userProperties = upValue;
        }
        else {
            this.userProperties = null;
        }
        return this;
    }
    async event(eventName) {
        const ip = (await (await fetch('https://checkip.amazonaws.com/').catch(() => undefined))?.text())?.trim();
        const payload = {
            client_id: this.clientID,
            user_id: this?.userID,
            ip_override: ip,
            events: [
                {
                    name: eventName,
                    params: {
                        session_id: this.sessionID,
                        ...this.customParams,
                    },
                },
            ],
        };
        if (this.userProperties) {
            Object.assign(payload, { user_properties: this.userProperties });
        }
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
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error sending GA event: ${error.message}`);
            }
            throw new Error('Unknown error sending GA event');
        }
    }
}
exports.default = Analytics4;

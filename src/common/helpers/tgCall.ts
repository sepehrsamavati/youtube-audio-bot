import fs from "node:fs";
// import axios from "axios";
import FormData from "form-data";
import { logError } from "./log.js";
import config from "../../config.js";
import shutdown from "./shutdown.js";
import { TelegramMethodEnum } from "../enums/tgMethod.enum.js";

const botUrl = config.tgbot.botUrl;

type TelegramResponse = {
    ok: boolean;
    result: any;
};

export default function TelegramCall(method: TelegramMethodEnum, params?: any, onResponse?: (data: any) => void) {
    let formData: FormData | null = params instanceof FormData ? params : null;
    if (params && params.file) {
        formData = new FormData();
        formData.append(method.slice(4).toLocaleLowerCase(), fs.createReadStream(params.file));
        delete params.file;
        Object.entries(params).forEach(param => (formData as FormData).append(param[0], typeof param[1] === "object" ? JSON.stringify(param[1]) : (typeof param[1] === "boolean" ? param[1].toString() : param[1])));
    }
    return new Promise<any>(resolve => {
        const returnResponse = (res: any) => {
            resolve(res);
            if (onResponse)
                onResponse(res);
        };

        fetch(botUrl + method, {
            method: "POST",
            body: formData || JSON.stringify(params),
            headers: formData ? formData.getHeaders() : {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.text())
            .then((_res: string) => {
                try {
                    const res = JSON.parse(_res) as TelegramResponse;
                    if (!res.ok)
                        logError("Telegram false response", res.result);

                    returnResponse(res?.result ?? null);
                } catch  {
                    const z =_res;
                    console.warn('goodie');
                }
            })
            .catch(error => {
                resolve(null);
                if (error.response && error.response.data)
                    console.error(error.response.data);
                else
                    console.error(error.message ?? error);
                if (error.code === 'ETIMEDOUT')
                    shutdown();
            });

        // axios
        // 	.post(botUrl + method, formData || params, formData ? { headers: formData.getHeaders() } : {})
        // 	.then((res: any) => {
        // 	})
        // 	.catch(error => {
        // 	});
    });
};

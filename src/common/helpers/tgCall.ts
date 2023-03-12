import fs from "node:fs";
import axios from "axios";
import config from "../../config.js";
import FormData from "form-data";

const botUrl = config.tgbot.botUrl;

export default function TelegramCall(method: string, params?: any, onResponse?: (data: any) => void) {
	let formData: any = null;
	if (params && params.file) {
		formData = new FormData();
		formData.append(method.slice(4).toLocaleLowerCase(), fs.createReadStream(params.file));
		delete params.file;
		Object.entries(params).forEach(param => formData.append(param[0], typeof param[1] === "object" ? JSON.stringify(param[1]) : param[1]));
	}
	return new Promise<any>(resolve => {
		const returnResponse = (res: any) => {
			resolve(res);
			if(onResponse)
				onResponse(res);
		};
		axios
			.post(botUrl + method, formData ? formData : params, formData ? { headers: formData.getHeaders() } : {})
			.then((res: any) => {
				if (res && res.data && res.data.result)
					returnResponse(res.data.result);
				else
					returnResponse(null);
			})
			.catch(error => {
				resolve(null);
				if (error.response && error.response.data)
					console.error(error.response.data);
				else
					console.error(error.message ?? error);
			});
	});
};

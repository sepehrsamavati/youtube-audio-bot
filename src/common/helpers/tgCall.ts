import axios from "axios";
import fs from "node:fs";
import config from "../../config";

const botUrl = config.tgbot.botUrl;

export default function TelegramCall (method: string, params?: any, onResponse?: (data: any) => void) {
	let formData: any = null;
	if(params && params.file)
	{
		formData = new FormData();
		formData.append(method.slice(4).toLocaleLowerCase(), fs.createReadStream(params.file));
		delete params.file;
		Object.entries(params).forEach( param => formData.append(param[0], typeof param[1] === "object" ? JSON.stringify(param[1]) : param[1]) );
	}
	axios
		.post( botUrl+method , formData ? formData : params, formData ? { headers: formData.getHeaders() } : {})
		.then((res: any) => {
			if(onResponse)
			{
				if(res && res.data && res.data.result)
					onResponse(res.data.result);
				else
					onResponse(null);
			}
		})
		.catch(error => {
			if(onResponse)
				onResponse(null);
			if(error.response && error.response.data)
				console.error(error.response.data);
			else
				console.error(error.message ?? error);
		});
};

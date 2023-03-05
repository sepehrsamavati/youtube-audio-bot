import fs from 'node:fs';
import fileExist from './fileExists.js';

export default function getFileSizeInMegaBytes(filename: string) {
	if(fileExist(filename))
	{
		const stats = fs.statSync(filename);
		const fileSizeInBytes = stats.size;
		if(typeof fileSizeInBytes !== "number")
		{
			return 0;
		}
		return fileSizeInBytes / (1024*1024);
	}
	else
	{
		return 0;
	}
}
import fs from 'node:fs';

export default function fileExist(path: string)
{
	try {
		return fs.existsSync(path);
	}
	catch(e)
	{
		return false;
	}
}
import fs from 'node:fs';

export default function fileExist(path: string)
{
	try {
		if(fs.existsSync(path))
		{
			return true;
		}
	}
	catch(e)
	{
		return false;
	}
}
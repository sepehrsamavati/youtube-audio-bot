import fs from "node:fs";
import fileExist from "./fileExists.js";

export default async function deleteFile(path: string, tries = 0)
{
	if(fileExist(path))
	{
		try {
			fs.unlinkSync(path);
		}
		catch (e)
		{
			if(tries < 5)
			{
				++tries;
				setTimeout(() => {
					deleteFile(path, tries);
				}, 10000 * tries).unref();
			}
		}
	}
}
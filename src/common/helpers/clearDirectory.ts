import fs from "node:fs";
import path from "node:path";

export default function clearDirectory(dir: string)
{
	fs.readdir(dir, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(path.join(dir, file), err => {
				if (err) console.error(err.message ?? err);
			});
		}
	});
}
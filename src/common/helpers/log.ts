const useColors = !Boolean(process.send); // Do not use colors when using PM2

export const log = (...args: any[]) => {
	const date = new Date();
    const timeLabel = `[${date.toLocaleTimeString('en-GB')}.${date.getMilliseconds().toString().padStart(3, '0')}]`;
    if(useColors)
	    console.log(`\x1b[35m${timeLabel}\x1b[0m`, ...args);
    else
	    console.log(timeLabel, ...args);
};

export const logError = (title = '', error: any = {}, data = '') => {
	console.error(
		`ERROR START ${new Date().toLocaleString()}`,
		`\n${title}\n`
	);
	console.error(error.message ?? error);
	console.error(
		data ? `\n${data}` : '',
		"\nERROR END\n\n\n"
	);
};
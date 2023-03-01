export default function log(...args: any) {
	const date = new Date();
	console.log(`\x1b[35m[${date.toLocaleTimeString('en-GB')}.${date.getMilliseconds().toString().padStart(3, '0')}]\x1b[0m`, ...args);
};

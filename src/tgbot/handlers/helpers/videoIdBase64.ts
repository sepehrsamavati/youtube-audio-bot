export function getUICode(id: string | number)
{
	return Buffer.from(id.toString()).toString('base64').replace(/=/g,"_");
}

export function getVideoId(UICode: string)
{
	return Buffer.from(UICode.replace(/_/g,"="), 'base64').toString();
}
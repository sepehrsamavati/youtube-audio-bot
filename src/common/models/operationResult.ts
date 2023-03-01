export default class OperationResult {
	public ok!: boolean;
	public message!: string;

	constructor(){
		this.ok = false;
	}

	public succeeded(message = "OK"){
		this.ok = true;
		this.message = message;
		return this;
	}

	public failed(message = "Failed"){
		this.ok = false;
		this.message = message;
		return this;
	}
};

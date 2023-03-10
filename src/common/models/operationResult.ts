import { UITextObj } from "../types/uitext";

export default class OperationResult {
	public ok!: boolean;
	public message!: keyof UITextObj;

	constructor(){
		this.ok = false;
	}

	public succeeded(message: keyof UITextObj = "ok"){
		this.ok = true;
		this.message = message;
		return this;
	}

	public failed(message: keyof UITextObj = "failed"){
		this.ok = false;
		this.message = message;
		return this;
	}
};

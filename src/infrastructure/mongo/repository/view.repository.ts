import ViewModel from "../models/views.js";
import OperationResult from "../../../common/models/operationResult.js";
import IViewRepository from "../../../application/contracts/view/repository.interface.js";

export default class ViewRepository implements IViewRepository {
	async isViewed(vid: string, uid: number): Promise<boolean> {
		const like = await ViewModel.exists({ video: vid, user: uid });
		return like != null;
	}
	async add(vid: string, uid: number): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await ViewModel.create({
				video: vid,
				user: uid
			});
			result.succeeded();
		} catch(e) {
			result.failed();
		}
		return result;
	}
};

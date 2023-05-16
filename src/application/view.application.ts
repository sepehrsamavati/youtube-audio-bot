import ViewRepository from "../infrastructure/mongo/repository/view.repository";
import IViewApplication from "./contracts/view/application.interface";


export default class ViewApplication implements IViewApplication {
    constructor(
        private viewRepository: ViewRepository
    ){}
    getTotalCount(): Promise<number> {
        return this.viewRepository.getTotalCount();
    }
};

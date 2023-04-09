import { log } from "../common/helpers/log.js";
import UIText from "../common/languages/UIText.js";
import UITextRepository from "../infrastructure/mongo/repository/uitext.repository.js";

export default async (uitextRepository: UITextRepository) => {

    const UITexts = UIText.getAll();

    let languageNumber = 0, textNumber = 0, totalCount = 0, insertOk = 0;
    for(const UIT of UITexts) {
        languageNumber++;
        textNumber = 0;
        const lang = UIT._lang;
        const dictionary = Object.entries(UIT);
        for(const [key, value] of dictionary) {
            textNumber++;
            totalCount++;
            log(`Insert text ${textNumber}/${dictionary.length} | Language ${languageNumber}/${UITexts.length}`);
            if(await uitextRepository.add(lang, key, value))
                insertOk++;
        }
    }

    log(`UIText successful inserts: ${insertOk}/${totalCount}`);
}
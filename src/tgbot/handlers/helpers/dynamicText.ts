import { DynamicTextRender } from "../../../common/types/dynamicText";

type DynamicTextHelpDetail = {
    key: string, value: string
};

export interface DynamicTextHelp {
    name: DynamicTextHelpDetail
};

export const dynamicTextHelp = {
    name: { key: "[NAME]", value: "User account name" }
};

export default function dynamicText(input: DynamicTextRender){
    const { text, update } = input;

    return text.replace(/\[(NAME)]/g, function(word){
        const WORD = word.slice(1,-1);
        switch(WORD){
            case "NAME":
                if(update.message?.from.first_name)
                {
                    return update.message.from.first_name;
                }
            break;
        }
        return word;
    });
}
import { DynamicTextRender } from "../../../common/types/dynamicText";

export default function dynamicText(input: DynamicTextRender){

	if(input.getWords){
		return {
			version: "1.0.0",
			words: {
				name: { key: "[NAME]", value: "User account name" }
			}
		};
	}
	else if(input.text && input.update) {
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
}
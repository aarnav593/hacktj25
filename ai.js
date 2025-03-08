import OpenAI from "openai";
API_KEY = os.getenv("API_KEY")
const openai = new OpenAI();
var difficulty;
var modal;
var quest;
var topic;

function generateQuestion(diff,ques,top){
quest = ques;
difficulty = diff;
topic = top;

}

if(difficulty == "easy"){
    modal = "gpt-4o-mini"
}else if (difficulty == "medium" || difficulty == "hard"){
    modal = "gpt-4o"
}
console.log(modal)

const completion = await openai.chat.completions.create({
    model: modal,
    messages: [
        {
            role:"system",
            content:"Return a unique "+ quest +" style, "+ difficulty + " question relating to the following topic, and return it in the json form: {question:'',a:'',b:'',c:'',d:'',e:'',correct:''}"
        },
        {
            role: "user",
            content: topic
        },
    ],
    store: true,
});

console.log(completion.choices[0].message);


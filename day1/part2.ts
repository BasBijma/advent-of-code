import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n');

let dialPosition = 50;
let result = 0;

for (let i = 0; i < input.length; i++) {
    const firstChar = input[i][0];
    const rest = Number(input[i].slice(1));
    for (let j = 0; j < rest; j++) {
        if (firstChar === 'L') {
            dialPosition--;
            if (dialPosition < 0) {
                dialPosition = 99;
            }
        } else if (firstChar === 'R') {
            dialPosition++;
            if (dialPosition > 99) {
                dialPosition = 0;
            }
        }
        if (dialPosition === 0) {
            result += 1;
        }
    }
    
}

console.log(result);
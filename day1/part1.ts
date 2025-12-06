import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n');

let dialPosition = 50;
let result = 0;


for (let i = 0; i < input.length; i++) {
    const firstChar = input[i][0];
    const rest = input[i].slice(1);
    if (firstChar === 'L') {
        dialPosition -= Number(rest);
    } else if (firstChar === 'R') {
        dialPosition += Number(rest);
    }
    if (dialPosition < 0) {
        console.log(input[i], dialPosition, 'looped round');  
        dialPosition = (dialPosition + 100) % 100;
        result += 1;
        continue
    }
    if (dialPosition > 100) {
        console.log(input[i], dialPosition, 'looped round');
        dialPosition = dialPosition % 100;
        result += 1;
        continue
    }
    if (dialPosition === 0) {
        console.log(input[i], dialPosition, 'hit zero exactly');
        result += 1;
        continue;
    }
    console.log(input[i], dialPosition, 'nothing interesting happened');
}

console.log(result);

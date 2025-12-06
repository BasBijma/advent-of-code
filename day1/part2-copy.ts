import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n');

let dialPosition = 50;
let result = 0;

console.log('Starting script new_____________');
for (let i = 0; i < input.length; i++) {
    if (dialPosition === 100) { 
        result += 1;
        dialPosition = 0; 
    }
    const firstChar = input[i][0];
    const rest = input[i].slice(1);
    console.log('---');
    console.log(dialPosition ,'with instruction', input[i]);
    if (firstChar === 'L') {
        dialPosition -= Number(rest);
    } else if (firstChar === 'R') {
        dialPosition += Number(rest);
    }
    console.log('moved to', dialPosition);
    if (dialPosition < 0) {
        const times = Math.floor(Math.abs(dialPosition) / 100);
        console.log(`smaller if - 100 fits ${times} times in ${dialPosition}`);
        console.log(`adding ${times + 1} to result`);
        dialPosition = (dialPosition + (100 * (times + 1))) % 100;
        result += times + 1;
        console.log('new dial position', dialPosition);
        continue
    }
    if (dialPosition > 100) {
        const times = Math.floor(Math.abs(dialPosition) / 100);
        dialPosition = (dialPosition + 100) % 100;
        console.log(`bigger if -- 100 fits ${times} times in ${dialPosition}`);
        console.log(`adding ${times} to result`);
        dialPosition = dialPosition % 100;
        result += times;
        console.log('new dial position', dialPosition);
        continue
    }
    if (dialPosition === 0 ) {
        console.log(input[i], dialPosition, 'hit zero exactly');
        result += 1;
        continue;
    }
    console.log('nothing interesting happened');
}

console.log(result);

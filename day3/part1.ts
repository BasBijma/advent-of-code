import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let result = 0;


for (let i = 0; i < input.length; i++) {
    let maxFirstDigit = {index: -1, value: 0};
    let maxSecondDigit = {index: -1, value: 0};

    for(let j = 0; j < input[i].length - 1; j++) {
        if (maxFirstDigit.value < parseInt(input[i][j])) {
            maxFirstDigit = {index: j, value: parseInt(input[i][j])};
        }
    }

    for (let k = maxFirstDigit.index + 1; k < input[i].length; k++) {
        if (maxSecondDigit.value < parseInt(input[i][k])) {
            maxSecondDigit = {index: k, value: parseInt(input[i][k])};
        }
    }
    
    result += Number(`${maxFirstDigit.value}${maxSecondDigit.value}`);
}


console.log(result)
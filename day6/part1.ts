import { getInputFile } from '../globals';
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(' ').filter(char => char !== ''));

const operations = input[0].map((_, i) => input.map(row => { return row[i]; }));

let result = 0;
for (const operation of operations) {
    const operator = operation.at(-1);
    const numbers = operation.slice(0, -1).map(n => parseInt(n));
    let operationResult = operator === '+' ? 0 : 1;
    for (const num of numbers) {
        if (operator === '+') operationResult += num;
        if (operator === '*') operationResult *= num;
    }
    result += operationResult;
}

console.log(result);
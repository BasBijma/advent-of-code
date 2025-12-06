import { getInputFile } from '../globals';
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(''));

const lines = input.slice(0, -1).map(row => [...row].reverse());
const operators = input.at(-1)!.filter(c => c !== ' ').reverse();

const operations: number[][] = [];
let currentOperation: string[][] = [];

for (let i = 0; i < lines[0].length; i++) {
    const operation = lines.map(row => row[i]);
    if (operation.every(char => char === ' ')) {
        operations.push(currentOperation.map(c => parseInt(c.join('').trim())));
        currentOperation = [];
    } else {
        currentOperation.push(operation);
    }
}
if (currentOperation.length) operations.push(currentOperation.map(c => parseInt(c.join('').trim())));

let result = 0;
for (let i = 0; i < operations.length; i++) {
    let operationResult = operators[i] === '+' ? 0 : 1;
    for (let j = 0; j < operations[i].length; j++) {
        if (operators[i] === '+') operationResult += operations[i][j];
        if (operators[i] === '*') operationResult *= operations[i][j];
    }
    result += operationResult;
}

console.log(result);
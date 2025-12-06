import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let result = 0;
let operations: (string | number)[][] = [], lines: string[][] = [], currentOperation: string[] = [];
let operators: string[] = [];

// Transpose input into octopus readable lines
for (let i = 0; i < input.length - 1; i++) {
    const line = []
    for(let j = input[i].length - 1; j >= 0; j--) {
        line.push(input[i][j])
    }
    lines.push(line)
}

// Separate numbers to operations
for (let i = 0; i < lines[0].length; i++) {
    const operation = []
    for (let j = 0; j < lines.length; j++) {
        operation.push(lines[j][i])
    }

    if (operation.every(char => char === ' ')) {
        operations.push(currentOperation);
        currentOperation = [];
        continue
    }

    currentOperation.push(operation)
    if (i === lines[0].length - 1) operations.push(currentOperation);
}

// reverse order operators
for (let i = input[0].length - 1; i >= 0; i--) {
    const operator = input[input.length - 1][i];
    if (operator !== ' ') operators.push(operator);
}

// slice whitespace
for (let i = 0; i < operations.length; i++) {
    for(let j = 0; j < operations[i].length; j++) {
        operations[i][j] = parseInt(operations[i][j].join('').trim())
    }
}


for (let i = 0; i < operations.length; i++) {
    let operationResult = 0
    for (let j = 0; j < operations[i].length; j++) {
        if (operators[i] === '+') {
            operationResult += operations[i][j]
        }
        if (operators[i] === '*') {
            if (operationResult === 0) operationResult = 1
            operationResult *=  operations[i][j]
        }
    }
    result += operationResult
}

console.log(result);
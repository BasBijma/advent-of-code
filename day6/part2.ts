import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(' '));
let result = 0;
let operations: any[] = [];


for (let i = 0; i < input[0].length; i++) {
    const numbers = []
    for(let j = 0; j < input.length; j++) {
        numbers.push(input[j][i])
    }
    operations.push(numbers)    
}


// for (const operation of operations) {
//     let operationResult = 0
//     const operator = operation[operation.length - 1]
//     for (let i = 0; i < operation.length - 1; i++) {
//         if (operator === '+') {
//             operationResult += parseInt(operation[i])
//         }
//         if (operator === '*') {
//             if (operationResult === 0) operationResult = 1
//             operationResult *= parseInt(operation[i])
//         }
//     }
//     result += operationResult
// }

console.log(operations);
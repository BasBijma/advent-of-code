import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(' '));
let result = 0;

console.log(input)

for (let y = 0; y < input.length; y++) {
    for(let x = 0; x < input[y].length; x++) {
        if (input[y][x] === '|') {
            result += 1;
        }
    }
}


console.log(result)
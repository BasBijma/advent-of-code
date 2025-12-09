import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(','));
// let result = 0;

console.log(input)
let largestSquare = 0;

for (let i = 0; i < input.length; i++) {
    for(let j = i + 1; j < input.length; j++) {
        const area = (Math.abs(parseInt(input[i][0]) - parseInt(input[j][0])) + 1) * (Math.abs(parseInt(input[i][1]) - parseInt(input[j][1])) + 1);
        console.log(area)
        if (area > largestSquare) {
            largestSquare = area;
        }
    }
}


console.log(largestSquare)
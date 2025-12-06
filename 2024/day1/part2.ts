import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split('   '));
const leftList = input.map(line => Number(line[0])).sort((a, b) => a - b);
const rightList = input.map(line => Number(line[1])).sort((a, b) => a - b);
let totalScore = 0;

for (let i = 0; i < leftList.length; i++) {
    for(let j = 0; j < rightList.length; j++) {
        if (leftList[i] === rightList[j]) {
            totalScore += leftList[i];
        }
    }
}

console.log(totalScore)
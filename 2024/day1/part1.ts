import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split('   '));
const leftList = input.map(line => Number(line[0])).sort((a, b) => a - b);
const rightList = input.map(line => Number(line[1])).sort((a, b) => a - b);
let difference = 0;

for (let i = 0; i < leftList.length; i++) {
    difference += Math.abs(rightList[i] - leftList[i]);
}

console.log(difference)
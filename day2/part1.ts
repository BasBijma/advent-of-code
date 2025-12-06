import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').flatMap(line => line.split(','));
let result = 0;

for (let i = 0; i < input.length; i++) {
    const range = input[i].split('-').map(Number);
    const start = range[0];
    const end = range[1];
    for (let j = start; j <= end; j++) {
        if (j.toString().length % 2 === 0) {
            const numStr = j.toString();
            const mid = Math.floor(numStr.length / 2);
            const firstHalf = numStr.slice(0, mid);
            const secondHalf = numStr.slice(mid);
            if(firstHalf == secondHalf) {
                result += Number(j);
            }
        }
    }
}

console.log(result)
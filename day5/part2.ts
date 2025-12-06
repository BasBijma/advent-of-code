import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const [ranges, ingredientIds] = getInputFile(import.meta.url).split('\n\n').map(group => group.split('\n').map(line =>line.split('-').map(Number)));
const merged = ranges.sort((a, b) => a[0] - b[0]).reduce((acc, [start, end]) => {
    const last = acc[acc.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else acc.push([start, end]);
    return acc;
}, [] as number[][]);

const result = merged.reduce((sum, [start, end]) => sum + end - start + 1, 0); 

console.log(result);

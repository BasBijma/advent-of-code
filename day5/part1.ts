import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const [ranges, ingredientIds] = getInputFile(import.meta.url).split('\n\n').map(group => group.split('\n').map(line =>line.split('-').map(Number)));

const result = ingredientIds.filter(([id]) => 
    ranges.some(([min, max]) => id >= min && id <= max)
).length;

console.log(result);

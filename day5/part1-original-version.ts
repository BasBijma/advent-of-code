import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const [ranges, ingredientIds] = getInputFile(import.meta.url).split('\n\n').map(group => group.split('\n').map(line =>line.split('-').map(Number)));
let result = 0;

const collapseRanges = () => {
    rangeLoop: for (let i = 0; i < ranges.length; i++) {
        compareLoop: for (let j = 0; j < ranges.length; j++) {
            const [currentRange, compareRange, start, end] = [ranges[i], ranges[j], 0, 1];
            if (currentRange[start] === 0 && currentRange[end] === 0) continue rangeLoop;
            if (i === j) continue compareLoop; 
            if (currentRange[start] <= compareRange[start] && currentRange[end] >= compareRange[start]) {
                ranges.push([currentRange[start], Math.max(currentRange[end], compareRange[end])]);
                ranges[i] = ranges[j] = [0, 0]; // mark for deletion
            }
        }
    }
}

// Remove ranges that have been marked for deletion
const stripRanges = () => {
    for (let i = ranges.length - 1; i >= 0; i--) {
        if (ranges[i][0] === 0 && ranges[i][1] === 0) ranges.splice(i, 1);
    }
}

const checkIngredients = (ingredientId: number) => {
    for (const range of ranges) {
        if (ingredientId >= range[0] && ingredientId <= range[1]) {
            result++;
            break;
        }
    }
}

collapseRanges();
stripRanges();

ingredientIds.forEach(ingredient => {
    checkIngredients(ingredient[0])
});

console.log(result);

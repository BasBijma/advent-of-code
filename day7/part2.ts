import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(''));

for (let y = 0; y < input.length - 1; y++) {
    for(let x = 0; x < input[y].length; x++) {
        if (input[y][x] === '|' || input[y][x] === 'S') {
            if (input[y+1][x] === '.') { 
                input[y+1][x] = '|'; 
            } 
            if (input[y+1][x] === '^') { 
                input[y+1][x - 1] = '|';
                input[y+1][x + 1] = '|';
            }
        }
    }

}

// Create grid counting paths in each postion within the input grid, starts at 0
const pathCount: number[][] = input.map(row => row.map(() => 0));

for (let x = 0; x < input[1].length; x++) {
    if (input[1][x] === '|') pathCount[1][x] = 1; // initialize start beam/path as path count 1
}
// Propagate path counts downward
for (let y = 1; y < input.length - 1; y++) {
    for (let x = 0; x < input[y].length; x++) {
        if (pathCount[y][x] > 0 && input[y][x] === '|') {
            const below = input[y + 1][x];
            if (below === '|') {
                // adds amount of paths from beam above to the beam directly below
                pathCount[y + 1][x] += pathCount[y][x];
            } else if (below === '^') {
                // adds amount of paths from beam above to both new split beams
                pathCount[y + 1][x - 1] += pathCount[y][x];
                pathCount[y + 1][x + 1] += pathCount[y][x];
            }
        }
    }
}

// Count total paths per beam reaching the end (or "|" positions in bottom row)
let totalPaths = 0;
const lastRow = input.length - 1;
for (let x = 0; x < input[lastRow].length; x++) {
    if (input[lastRow][x] === '|') {
        totalPaths += pathCount[lastRow][x];
    }
}

console.log('Total:', totalPaths);
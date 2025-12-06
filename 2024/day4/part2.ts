import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const grid = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let XmasCount = 0;

//check X mas
for (let y = 1; y < grid.length - 1; y++) {
    for(let x = 1; x < grid[y].length - 1; x++) {
        if(grid[y][x] !== 'A') continue;
        if(grid[y+1][x+1] === 'M' && grid[y-1][x-1] === 'S' ) {
            if(grid[y+1][x-1] === 'M' && grid[y-1][x+1] === 'S') {
                XmasCount++;
                continue;
            }
            if(grid[y+1][x-1] === 'S' && grid[y-1][x+1] === 'M') {
                XmasCount++;
                continue;
            }
        }
        if(grid[y+1][x-1] === 'M' && grid[y-1][x+1] === 'S' ) {
            if(grid[y+1][x+1] === 'M' && grid[y-1][x-1] === 'S') {
                XmasCount++;
                continue;
            }
            if(grid[y+1][x+1] === 'S' && grid[y-1][x-1] === 'M') {
                XmasCount++;
                continue;
            }
        } 
        if(grid[y+1][x+1] === 'S' && grid[y-1][x-1] === 'M' ) {
            if(grid[y+1][x-1] === 'S' && grid[y-1][x+1] === 'M') {
                XmasCount++;
                continue;
            }
            if(grid[y+1][x-1] === 'M' && grid[y-1][x+1] === 'S') {
                XmasCount++;
                continue;
            }
        }
        if(grid[y+1][x-1] === 'S' && grid[y-1][x+1] === 'M' ) {
            if(grid[y+1][x+1] === 'S' && grid[y-1][x-1] === 'M') {
                XmasCount++;
                continue;
            }
            if(grid[y+1][x+1] === 'M' && grid[y-1][x-1] === 'S') {
                XmasCount++;
                continue;
            }
        }
    }
}


console.log(XmasCount)
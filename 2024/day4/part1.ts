import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const grid = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let XmasCount = 0;


//check horizontal L to R
for (let y = 0; y < grid.length; y++) {
    for(let x = 0; x < grid[y].length - 3; x++) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y][x+1] !== 'M') continue;
        if(grid[y][x+2] !== 'A') continue;
        if(grid[y][x+3] !== 'S') continue;
        XmasCount++;
        x += 3;
    }
}

//check horizontal R to L
for (let y = 0; y < grid.length; y++) {
    for(let x = grid[y].length; x > 2; x--) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y][x-1] !== 'M') continue;
        if(grid[y][x-2] !== 'A') continue;
        if(grid[y][x-3] !== 'S') continue;
        XmasCount++;
        x -= 3;
    }
}

//check vertical T to B
for (let y = 0; y < grid.length - 3; y++) {
    for(let x = 0; x < grid[y].length; x++) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y+1][x] !== 'M') continue;
        if(grid[y+2][x] !== 'A') continue;
        if(grid[y+3][x] !== 'S') continue;
        XmasCount++;
    }
}

//check vertical B to T
for (let y = grid.length - 1; y > 2 ; y--) {
    for(let x = 0; x < grid[y].length; x++) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y-1][x] !== 'M') continue;
        if(grid[y-2][x] !== 'A') continue;
        if(grid[y-3][x] !== 'S') continue;
        XmasCount++;
    }
}

//check diagonal TL to BR
for (let y = 0; y < grid.length - 3; y++) {
    for(let x = 0; x < grid[y].length - 3; x++) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y+1][x+1] !== 'M') continue;
        if(grid[y+2][x+2] !== 'A') continue;
        if(grid[y+3][x+3] !== 'S') continue;
        XmasCount++;
    }
}

//check diagonal BR to TL
for (let y = grid.length - 1; y > 2; y--) {
    for(let x = grid[y].length - 1; x > 2; x--) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y-1][x-1] !== 'M') continue;
        if(grid[y-2][x-2] !== 'A') continue;
        if(grid[y-3][x-3] !== 'S') continue;
        XmasCount++;
    }
}

//check diagonal TR to BL   
for(let y = 0; y < grid.length - 3; y++) {
    for(let x = grid[y].length - 1; x > 2; x--) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y+1][x-1] !== 'M') continue;
        if(grid[y+2][x-2] !== 'A') continue;
        if(grid[y+3][x-3] !== 'S') continue;
        XmasCount++;
    }
}

//check diagonal BL to TR   
for(let y = grid.length - 1; y > 2; y--) {
    for(let x = 0; x < grid[y].length - 3; x++) {
        if(grid[y][x] !== 'X') continue;
        if(grid[y-1][x+1] !== 'M') continue;
        if(grid[y-2][x+2] !== 'A') continue;
        if(grid[y-3][x+3] !== 'S') continue;
        XmasCount++;
    }
}

console.log(XmasCount)
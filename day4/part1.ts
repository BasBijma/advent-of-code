import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const grid = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let result = 0;

const checkAdjacent = (x: number, y: number) => {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0],[1,1],[1,-1],[-1,1],[-1,-1]];
    let freeAdjacentSpaces = 0;
    for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[newY].length) {
            if (grid[newY][newX] === '@') {
                continue
            } 
        }
        freeAdjacentSpaces++;
        if (freeAdjacentSpaces >= 5) { 
            result++; 
            break;
        }
    }
};

for (let y = 0; y < grid.length; y++) {
    xloop: for(let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === '@') {
            checkAdjacent(x, y);
        } else {
            continue xloop;
        }
    }
}


console.log(result)
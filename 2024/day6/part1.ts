import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const grid = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let escaped = false;
let direction = 'up'
let location = {y:0, x:0}
grid.find((row, y) => row.find((cell, x) => {if(cell === '^') {location.x = x; location.y = y; return}}));
grid[location.y][location.x] = '.';
const visitedLocations = [[location.y, location.x]];

const takeStep = () => {
    if (direction === 'up') {
        if(location.y - 1 < 0) {
            escaped = true;
            return;
        }
        if (grid[location.y - 1][location.x] === '.') {
            location.y --;
            return;
        }
        direction = 'right';
        return;
    }
    if (direction === 'right') {
        if(location.x + 2 > grid[0].length) {
            escaped = true;
            return;
        }
        if (grid[location.y][location.x + 1] === '.') {
            location.x ++;
            return;
        }
        direction = 'down';
        return;
    }
    if (direction === 'down') {
        if(location.y + 2 > grid.length) {
            escaped = true;
            return;
        }
        if (grid[location.y + 1][location.x] === '.') {
            location.y ++;
            return;
        }
        direction = 'left';
        return;
    }
    if(location.x - 1 < 0) {
        escaped = true;
        return;
    }
    if (grid[location.y][location.x - 1] === '.') {
        location.x --;
        return;
    }
    direction = 'up';
}



navigationLoop:for (let i = 0; i < grid.length * grid[0].length ; i++) {
    takeStep();
    if (escaped) {
        break;
    }
    for(const visitedLocation of visitedLocations ) {
        if (visitedLocation[0] === location.y && visitedLocation[1] === location.x) {
            continue navigationLoop ;
        }
    }
    visitedLocations.push([location.y, location.x])
}



console.log(visitedLocations.length)
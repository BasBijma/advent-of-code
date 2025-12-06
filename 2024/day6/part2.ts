import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const grid = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let escaped = false;
let direction = 'up'
let location = {y:0, x:0}
grid.find((row, y) => row.find((cell, x) => {if(cell === '^') {location.x = x; location.y = y; return}}));
grid[location.y][location.x] = '.';
const trail: [{y:number, x:number, direction:string}] = [{y:location.y, x:location.x, direction}];
const crossingPoints: number[][] = [];

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
    if (direction === 'up') {
        if (trail.find((point) => point.y === location.y && point.direction === 'right' )) {
            crossingPoints.push([location.y, location.x]);
        }
    }
    if (direction === 'right') {
        if (trail.find((point) => point.x === location.x && point.direction === 'down' )) {
            crossingPoints.push([location.y, location.x]);
        }
    }
    if (direction === 'down') {
        if (trail.find((point) => point.y === location.y && point.direction === 'left' )) {
            crossingPoints.push([location.y, location.x]);
        }
    }
    if (direction === 'left') { 
        if (trail.find((point) => point.x === location.x && point.direction === 'up' )) {
            crossingPoints.push([location.y, location.x]);
        }
    }


    trail.push({y: location.y, x: location.x, direction});
    if (escaped) {
        break;
    }
}

console.log(crossingPoints.length)
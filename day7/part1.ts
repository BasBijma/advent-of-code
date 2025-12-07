import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let result = 0;


for (let y = 0; y < input.length - 1; y++) {
    for(let x = 0; x < input[y].length; x++) {
        if (input[y][x] === '|' || input[y][x] === 'S') {
            if (input[y+1][x] === '.') { 
                //console.log(`replaced . with | at x:${x} y:${y+1}`);
                input[y+1][x] = '|'; 
                console.log(input[y+1][x]);
            } 
            if (input[y+1][x] === '^') { 
                console.log(`replaced adjacent to ^ with | at x:${x+1} & ${x-1} y:${y+1}`);
                input[y+1][x - 1] = '|';
                input[y+1][x + 1] = '|';
                result += 1;
            }
        }
    }
}

console.log(result)
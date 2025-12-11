import { getInputFile } from '../globals';
const input = getInputFile(import.meta.url).split('\n').filter(l => l.trim());

function parseLine(line: string) {
    const targetMatch = line.match(/\[([.#]+)\]/);
    const target = targetMatch![1].split('').map(c => c === '#' ? 1 : 0);
    const buttonMatches = [...line.matchAll(/\(([0-9,]+)\)/g)];
    const buttons = buttonMatches.map(m => m[1].split(',').map(Number));
    return { target, buttons, numLights: target.length };
}

function applyButtons(numLights: number, buttons: number[][], pressed: number[]): number[] {
    const state = new Array(numLights).fill(0);
    for (let i = 0; i < buttons.length; i++) {
        if (pressed[i]) {
            for (const light of buttons[i]) {
                state[light] ^= 1;
            }
        }
    }
    return state;
}

function arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

function findMinPresses(target: number[], buttons: number[][], numLights: number): number {
    const n = buttons.length;
    let minPresses = Infinity;
    
    for (let mask = 0; mask < (1 << n); mask++) {
        const pressed = [];
        let count = 0;
        for (let i = 0; i < n; i++) {
            pressed.push((mask >> i) & 1);
            if ((mask >> i) & 1) count++;
        }
        if (count >= minPresses) continue;
        
        const state = applyButtons(numLights, buttons, pressed);
        if (arraysEqual(state, target)) {
            minPresses = count;
        }
    }
    return minPresses;
}

let result = 0;
for (const line of input) {
    const { target, buttons, numLights } = parseLine(line);
    const minPresses = findMinPresses(target, buttons, numLights);
    result += minPresses;
}

console.log(result);
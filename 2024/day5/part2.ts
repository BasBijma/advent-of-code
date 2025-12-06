import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n\n')
const values = input[0].split('\n').map((x) => x.split('|'));
const updates = input[1].split('\n').map((x) => x.split(','));
const faultyUpdates: string[][] = []
let result = 0;

function swapIndexes(array: any[], index1: number, index2: number): void {
    console.log('swappie', array)
    const temp = array[array.indexOf(index1)];
    const tempIndex = array.indexOf(index2)
    array[array.indexOf(index1)] = index2;
    array[tempIndex] = temp;
}

updateLoop:for (const update of updates) {
    for (const updateIndex of update) {
        valueLoop:for (const value of values) {
            if (!value.includes(updateIndex)) continue valueLoop
            if (value[0] === updateIndex) {
                if (!update.includes(value[1])) continue valueLoop 
                if (update.indexOf(value[0]) < update.indexOf(value[1])) {
                    continue valueLoop
                }
            }
            if (!update.includes(value[0])) continue valueLoop
            if (update.indexOf(updateIndex) > update.indexOf(value[0])) {
                continue valueLoop
            }
            faultyUpdates.push(update)
            continue updateLoop
        }
    }
}

function checkAndSwap(update): void {
    for (const updateIndex of update) {
        valueLoop:for (const value of values) {
            if (!value.includes(updateIndex)) continue valueLoop
            if (value[0] === updateIndex) {
                if (!update.includes(value[1])) continue valueLoop 
                if (update.indexOf(value[0]) > update.indexOf(value[1])) {
                    swapIndexes(update, value[0], value[1])
                    checkAndSwap(update)
                }
            }
            if (!update.includes(value[0])) continue valueLoop
            if (update.indexOf(value[0]) > update.indexOf(value[1])) {
                swapIndexes(update, value[0], value[1])
                checkAndSwap(update)
            }
        }
    }
}


updateLoop:for (const update of faultyUpdates) {
    checkAndSwap(update)
    result += Number(update[Math.floor(update.length / 2)])
}

console.log(result)
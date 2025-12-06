import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split(`don't()`)
const digitNumberRegex = /^\d{1,3}$/;
let total = 0;

const runInstructions = (instructions: string) => {
    const instructionLine = instructions.split('mul(').map(x => x.split(')')).map(y => y[0].split(','))
    instructionLine.forEach(digits => { 
        if (!digitNumberRegex.test(digits[0]) || !digitNumberRegex.test(digits[1]) || digits.length !== 2) return
        total += Number(digits[0]) * Number(digits[1])
    })
}

for (let i = 0; i < input.length; i++) {
    if (i === 0) { runInstructions(input[0]); continue }
    let validInstructions = input[i].split('do()')
    if (validInstructions.length < 2) continue
    for (let j = 1; j < validInstructions.length; j++) runInstructions(validInstructions[j])
}

console.log(total)
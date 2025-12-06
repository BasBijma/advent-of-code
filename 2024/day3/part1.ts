import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const multiplicationDigits = getInputFile(import.meta.url).split('mul(').map(instructionBegin => instructionBegin.split(')')).map(multiplication => multiplication[0].split(','))
const digitNumberRegex = /^\d{1,3}$/;
let total = 0;

multiplicationDigits.forEach(digits => { 
    if (!digitNumberRegex.test(digits[0]) || !digitNumberRegex.test(digits[1]) || digits.length !== 2) return
    total += Number(digits[0]) * Number(digits[1])
})

console.log(total)
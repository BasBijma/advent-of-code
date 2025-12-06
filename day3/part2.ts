import { getInputFile } from '../globals'; // automates getting powerSupply.txt for corresponding day for every day 
const powerSupply = getInputFile(import.meta.url).split('\n').map(line => line.split(''));
let result = 0;


for (let bank = 0; bank < powerSupply.length; bank++) {
    let currentBattery = -1;
    let totalJoltage = "";
    const count = 12;

    for (let step = 0; step < count; step++) {
        let maxJoltage = {index: -1, value: -1};
        const remainingNeeded = count - 1 - step;
        const searchLimit = powerSupply[bank].length - remainingNeeded; // check if bank has enough batteries left

        for (let battery = currentBattery + 1; battery < searchLimit; battery++) {
            const currentJoltage = parseInt(powerSupply[bank][battery]);
            if (maxJoltage.value < currentJoltage) {
                maxJoltage = {index: battery, value: currentJoltage};
                if (currentJoltage === 9) break;
            }
        }
        totalJoltage += maxJoltage.value;
        currentBattery = maxJoltage.index;
    }
    
    result += Number(totalJoltage);
}


console.log(result)
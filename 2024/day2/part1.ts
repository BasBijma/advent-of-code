import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(' ').map(value => Number(value)));
let safeReports = 0;

input.forEach(report => {
    if (report[0] == report[1])return;
    const orderDesc = report[0] > report[1];

    if (orderDesc) {
        for (let i = 0; i < report.length; i++) {
            if(report.length == i+1) safeReports++;
            if (report[i] <= report[i+1]) {
                break;   
            }
            if (report[i] - report[i+1] > 3){
                break;
            } 
        }
    } else {
        for (let i = 0; i < report.length; i++) {
            if(report.length == i+1) safeReports++;;
            if (report[i] >= report[i+1]) {
                break;   
            }
            if (report[i+1] - report[i] > 3){
                break;
            }
        }
    }
});

console.log(safeReports);
import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(' ').map(Number));
let safeReports = 0;

let checkReport = (report: number[]) => {
    let asc = false;
    let desc = false;
    for(let i = 0; i < report.length - 1; i++) {
        let diff = report[i] - report[i+1];
        if (diff > 0) {
            desc = true;
        } if (diff < 0) {
            asc = true;
        }
        if ((asc && desc) || diff === 0 || Math.abs(diff) > 3) {
            return i;
        }
    }
    return -1;
}

for (let i = 0; i < input.length; i++) {
    if ( checkReport(input[i]) < 0) {
        safeReports++;
        continue;
    }

    for (let j = 0; j < input[i].length; j++) {
        let dampnedReport = [...input[i]];
        dampnedReport.splice(j, 1);
        if ( checkReport(dampnedReport) < 0) {
            safeReports++;
            break;
        }
    }
};

console.log(safeReports)
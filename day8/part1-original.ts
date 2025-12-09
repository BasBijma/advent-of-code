import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(',').map(Number));
let result = 1;
let circuits: number[][][] = [];
let connections = new Set<string>();

const connectionKey = (box1: number[], box2: number[]) => {
    const sorted = [box1.join(','), box2.join(',')].sort();
    return sorted.join('|');
};

const circuitShortestDistances = () => {
    let minDist: {indices: number[], boxes: number[][], distance: number, circuitNum: number | null} = {
        indices: [], boxes: [], distance: Infinity, circuitNum: null
    };
    const [x,y,z] = [0,1,2];

    // Compare input boxes to each other
    for (let i = 0; i < input.length; i++) {
        const box = input[i];
        for (let j = i + 1; j < input.length; j++) {
            const otherBox = input[j];
            if (connections.has(connectionKey(box, otherBox))) continue;
            const diff = Math.hypot(box[x] - otherBox[x], box[y] - otherBox[y], box[z] - otherBox[z]);
            if (diff < minDist.distance) {
                minDist = {indices: [i, j], boxes: [box, otherBox], distance: diff, circuitNum: null};
            }
        }

        // Compare input boxes to circuit boxes
        for (let c = 0; c < circuits.length; c++) { 
            for (let k = 0; k < circuits[c].length; k++) {
                const otherBox = circuits[c][k];
                if (connections.has(connectionKey(box, otherBox))) continue;
                const diff = Math.hypot(box[x] - otherBox[x], box[y] - otherBox[y], box[z] - otherBox[z]);
                if (diff < minDist.distance) {
                    minDist = {indices: [i, k], boxes: [box, otherBox], distance: diff, circuitNum: c};
                }
            }
        }
    }

    // Compare boxes within and across circuits
    for (let c1 = 0; c1 < circuits.length; c1++) {
        for (let b1 = 0; b1 < circuits[c1].length; b1++) {
            const box = circuits[c1][b1];
            for (let c2 = c1; c2 < circuits.length; c2++) {
                const startB2 = c1 === c2 ? b1 + 1 : 0;
                for (let b2 = startB2; b2 < circuits[c2].length; b2++) {
                    const otherBox = circuits[c2][b2];
                    if (connections.has(connectionKey(box, otherBox))) continue;
                    const diff = Math.hypot(box[x] - otherBox[x], box[y] - otherBox[y], box[z] - otherBox[z]);
                    if (diff < minDist.distance) {
                        minDist = {indices: [c1, c2], boxes: [box, otherBox], distance: diff, circuitNum: -1};
                    }
                }
            }
        }
    }

    // Record the new connection
    if (minDist.boxes.length === 2) {
        connections.add(connectionKey(minDist.boxes[0], minDist.boxes[1]));
    }

    // Handle connection between/within circuits
    if (minDist.circuitNum === -1) {
        const [c1, c2] = minDist.indices;
        // If different circuits, merge them
        if (c1 !== c2) {
            circuits[c1].push(...circuits[c2]);
            circuits.splice(c2, 1);
        }
        return;
    }

    // Handle adding input to existing circuit
    if (minDist.circuitNum !== null) {
        const [i] = minDist.indices;
        circuits[minDist.circuitNum].push(input[i]);
        input.splice(i, 1);
        return;
    }

    // Handle creating new circuit from two input boxes
    const [i, j] = minDist.indices;
    circuits.push([input[i], input[j]]);
    input.splice(Math.max(i, j), 1);
    input.splice(Math.min(i, j), 1);
}

for (let n = 0; n < 1000; n++) {
    if(n%10 === 0) console.log(`Iteration ${n}, circuits: ${circuits.length}, remaining input boxes: ${input.length}`);
    circuitShortestDistances();
}

const top3 = circuits.map(c => c.length).sort((a, b) => b - a).slice(0, 3);
for (const len of top3) {
    result *= len;
}

console.log('Result:', result);

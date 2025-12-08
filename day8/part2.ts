import { getInputFile } from '../globals'; // automates getting input.txt for corresponding day for every day 
const input = getInputFile(import.meta.url).split('\n').map(line => line.split(',').map(Number));

// Calculate all pairwise distances
const edges: {box1: number[], box2: number[], dist: number}[] = [];
for (let i = 0; i < input.length; i++) {
    for (let j = i + 1; j < input.length; j++) {
        edges.push({
            box1: input[i],
            box2: input[j],
            dist: Math.hypot(...input[i].map((coord, axis) => coord - input[j][axis]))
        });
    }
}
edges.sort((edgeA, edgeB) => edgeA.dist - edgeB.dist);

// Union-Find with path compression
const parent = new Map<string, string>();
const find = (key: string): string => {
    if (!parent.has(key)) parent.set(key, key);
    if (parent.get(key) !== key) parent.set(key, find(parent.get(key)!));
    return parent.get(key)!;
};

const union = (boxKey1: string, boxKey2: string) => { parent.set(find(boxKey1), find(boxKey2)); };

// Kruskal's MST - last edge completes the tree 
// https://en.wikipedia.org/wiki/Kruskal%27s_algorithm#/media/File:KruskalDemo.gif
let lastEdge: typeof edges[0] | null = null;
for (const edge of edges) {
    const box1Key = edge.box1.join(','), box2Key = edge.box2.join(',');
    if (find(box1Key) !== find(box2Key)) {
        union(box1Key, box2Key);
        lastEdge = edge;
    }
}

console.log('Last 2 boxes that made the circuit whole:');
console.log('Box 1:', lastEdge?.box1);
console.log('Box 2:', lastEdge?.box2);
console.log('Distance:', lastEdge?.box1[0] * lastEdge?.box2[0]);

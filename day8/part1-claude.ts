import { getInputFile } from '../globals';
const input = getInputFile(import.meta.url).split('\n').filter(l => l.trim());

type Point = { x: number; y: number; z: number; idx: number };

const points: Point[] = input.map((line, idx) => {
    const [x, y, z] = line.split(',').map(Number);
    return { x, y, z, idx };
});

function distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// Generate all pairs with distances
const pairs: { i: number; j: number; dist: number }[] = [];
for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
        pairs.push({ i, j, dist: distance(points[i], points[j]) });
    }
}

// Sort by distance
pairs.sort((a, b) => a.dist - b.dist);

// Union-Find
const parent: number[] = points.map((_, i) => i);
const rank: number[] = points.map(() => 0);

function find(x: number): number {
    if (parent[x] !== x) {
        parent[x] = find(parent[x]);
    }
    return parent[x];
}

function union(x: number, y: number): boolean {
    const px = find(x);
    const py = find(y);
    if (px === py) return false; // Already in same circuit
    if (rank[px] < rank[py]) {
        parent[px] = py;
    } else if (rank[px] > rank[py]) {
        parent[py] = px;
    } else {
        parent[py] = px;
        rank[px]++;
    }
    return true;
}

// Connect 1000 closest pairs (process 1000 shortest, even if already connected)
for (let i = 0; i < 1000 && i < pairs.length; i++) {
    union(pairs[i].i, pairs[i].j);
}

// Count circuit sizes
const circuitSizes = new Map<number, number>();
for (let i = 0; i < points.length; i++) {
    const root = find(i);
    circuitSizes.set(root, (circuitSizes.get(root) || 0) + 1);
}

// Get three largest
const sizes = Array.from(circuitSizes.values()).sort((a, b) => b - a);
const result = sizes[0] * sizes[1] * sizes[2];

console.log('Three largest circuits:', sizes.slice(0, 3));
console.log('Answer:', result);

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8')
    .split('\n')
    .map(line => line.split(',').map(Number));

// Build boundary segments from input
function buildBoundarySegments(points) {
    const segments = [];
    for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        segments.push({
            x1: Math.min(x1, x2), y1: Math.min(y1, y2),
            x2: Math.max(x1, x2), y2: Math.max(y1, y2),
            horizontal: y1 === y2
        });
    }
    return segments;
}

// Check if a point lies on the perimeter
function createPerimeterChecker(segments) {
    return function isOnPerimeter(x, y) {
        for (const seg of segments) {
            if (seg.horizontal) {
                if (y === seg.y1 && x >= seg.x1 && x <= seg.x2) return true;
            } else {
                if (x === seg.x1 && y >= seg.y1 && y <= seg.y2) return true;
            }
        }
        return false;
    };
}

// Build coordinate compression grid
function buildCompressedCoordinates(points) {
    const allX = new Set();
    const allY = new Set();
    for (const [x, y] of points) {
        allX.add(x);
        allY.add(y);
    }

    const sortedX = [...allX].sort((a, b) => a - b);
    const sortedY = [...allY].sort((a, b) => a - b);

    // Create expanded coordinate lists with gaps for flood fill
    const xCoords = [sortedX[0] - 1];
    for (let i = 0; i < sortedX.length; i++) {
        xCoords.push(sortedX[i]);
        if (i < sortedX.length - 1) xCoords.push(sortedX[i] + 1);
    }
    xCoords.push(sortedX[sortedX.length - 1] + 1);

    const yCoords = [sortedY[0] - 1];
    for (let i = 0; i < sortedY.length; i++) {
        yCoords.push(sortedY[i]);
        if (i < sortedY.length - 1) yCoords.push(sortedY[i] + 1);
    }
    yCoords.push(sortedY[sortedY.length - 1] + 1);

    const xToIdx = new Map();
    const yToIdx = new Map();
    xCoords.forEach((x, i) => xToIdx.set(x, i));
    yCoords.forEach((y, i) => yToIdx.set(y, i));

    return { xCoords, yCoords, xToIdx, yToIdx };
}

// Mark perimeter on compressed grid
function buildPerimeterGrid(xCoords, yCoords, isOnPerimeter) {
    const grid = [];
    for (let xi = 0; xi < xCoords.length; xi++) {
        grid[xi] = [];
        for (let yi = 0; yi < yCoords.length; yi++) {
            grid[xi][yi] = isOnPerimeter(xCoords[xi], yCoords[yi]);
        }
    }
    return grid;
}

// Flood fill voor de outside area
function findExteriorRegion(grid, width, height) {
    const exterior = new Set();
    const queue = [[0, 0]];

    while (queue.length > 0) {
        const [xi, yi] = queue.pop();
        const key = `${xi},${yi}`;
        if (exterior.has(key) || grid[xi]?.[yi]) continue;
        if (xi < 0 || xi >= width || yi < 0 || yi >= height) continue;
        exterior.add(key);
        queue.push([xi + 1, yi], [xi - 1, yi], [xi, yi + 1], [xi, yi - 1]);
    }

    return exterior;
}

// Check if rectangle is inside valid boundary
function createValidRectangleChecker(xToIdx, yToIdx, exterior) {
    return function isValidRectangle(rx1, ry1, rx2, ry2) {
        const xi1 = xToIdx.get(rx1), xi2 = xToIdx.get(rx2);
        const yi1 = yToIdx.get(ry1), yi2 = yToIdx.get(ry2);
        const minXi = Math.min(xi1, xi2), maxXi = Math.max(xi1, xi2);
        const minYi = Math.min(yi1, yi2), maxYi = Math.max(yi1, yi2);
        
        for (let xi = minXi; xi <= maxXi; xi++) {
            for (let yi = minYi; yi <= maxYi; yi++) {
                if (exterior.has(`${xi},${yi}`)) return false;
            }
        }
        return true;
    };
}

// Find largest valid rectangle
function findLargestRectangle(points, isValidRectangle) {
    let largestArea = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[j];
            
            if (isValidRectangle(x1, y1, x2, y2)) {
                const area = (Math.abs(x1 - x2) + 1) * (Math.abs(y1 - y2) + 1);
                if (area > largestArea) {
                    largestArea = area;
                }
            }
        }
    }
    return largestArea;
}

// main
const segments = buildBoundarySegments(input);
const isOnPerimeter = createPerimeterChecker(segments);
const { xCoords, yCoords, xToIdx, yToIdx } = buildCompressedCoordinates(input);
const perimeterGrid = buildPerimeterGrid(xCoords, yCoords, isOnPerimeter);
const exterior = findExteriorRegion(perimeterGrid, xCoords.length, yCoords.length);
const isValidRectangle = createValidRectangleChecker(xToIdx, yToIdx, exterior);
const largestArea = findLargestRectangle(input, isValidRectangle);

console.log(largestArea);

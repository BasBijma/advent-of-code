import { getInputFile } from '../globals';
const input = getInputFile(import.meta.url).split('\n').filter(l => l.trim());

function parseLine(line: string) {
    const buttonMatches = [...line.matchAll(/\(([0-9,]+)\)/g)];
    const buttons = buttonMatches.map(m => m[1].split(',').map(Number));
    const joltageMatch = line.match(/\{([0-9,]+)\}/);
    const target = joltageMatch![1].split(',').map(Number);
    return { buttons, target };
}

function solve(buttons: number[][], target: number[]): number {
    const n = buttons.length;
    const m = target.length;
    
    // Build augmented matrix for Gaussian elimination
    const matrix: number[][] = [];
    for (let j = 0; j < m; j++) {
        const row = new Array(n + 1).fill(0);
        for (let i = 0; i < n; i++) {
            if (buttons[i].includes(j)) row[i] = 1;
        }
        row[n] = target[j];
        matrix.push(row);
    }
    
    // Gaussian elimination (integer arithmetic)
    const pivotCol: number[] = [];
    let row = 0;
    for (let col = 0; col < n && row < m; col++) {
        let pivotRow = -1;
        for (let r = row; r < m; r++) {
            if (matrix[r][col] !== 0) { pivotRow = r; break; }
        }
        if (pivotRow === -1) continue;
        
        [matrix[row], matrix[pivotRow]] = [matrix[pivotRow], matrix[row]];
        
        for (let r = 0; r < m; r++) {
            if (r !== row && matrix[r][col] !== 0) {
                const factor = matrix[r][col] / matrix[row][col];
                for (let c = 0; c <= n; c++) {
                    matrix[r][c] -= factor * matrix[row][c];
                }
            }
        }
        pivotCol.push(col);
        row++;
    }
    
    // Normalize pivot rows
    for (let r = 0; r < pivotCol.length; r++) {
        const pivot = matrix[r][pivotCol[r]];
        for (let c = 0; c <= n; c++) matrix[r][c] /= pivot;
    }
    
    // Check for inconsistency
    for (let r = row; r < m; r++) {
        if (Math.abs(matrix[r][n]) > 1e-9) return 0;
    }
    
    // Identify free variables
    const freeVars: number[] = [];
    const pivotSet = new Set(pivotCol);
    for (let i = 0; i < n; i++) {
        if (!pivotSet.has(i)) freeVars.push(i);
    }
    
    // If no free variables, compute solution directly
    if (freeVars.length === 0) {
        let total = 0;
        for (let r = 0; r < pivotCol.length; r++) {
            const val = Math.round(matrix[r][n]);
            if (val < 0) return 0;
            total += val;
        }
        return total;
    }
    
    // Search over free variables - enumerate all valid combinations
    const maxFree = Math.max(...target);
    let best = Infinity;
    
    function evalSolution(freeVals: number[]): number {
        let total = 0;
        for (let r = 0; r < pivotCol.length; r++) {
            let val = matrix[r][n];
            for (let f = 0; f < freeVars.length; f++) {
                val -= matrix[r][freeVars[f]] * freeVals[f];
            }
            val = Math.round(val);
            if (val < 0) return Infinity;
            total += val;
        }
        for (const v of freeVals) total += v;
        return total;
    }
    
    function search(idx: number, freeVals: number[]) {
        if (idx === freeVars.length) {
            const total = evalSolution(freeVals);
            if (total < best) best = total;
            return;
        }
        
        // Compute valid range for this free variable given previous choices
        let minVal = 0, maxVal = maxFree;
        for (let r = 0; r < pivotCol.length; r++) {
            const coeff = matrix[r][freeVars[idx]];
            if (Math.abs(coeff) < 1e-9) continue;
            let rhs = matrix[r][n];
            for (let f = 0; f < idx; f++) {
                rhs -= matrix[r][freeVars[f]] * freeVals[f];
            }
            // Remaining free vars (idx+1..end) also contribute
            // For conservative bounds, assume they can be 0 or maxFree
            let minRhs = rhs, maxRhs = rhs;
            for (let f = idx + 1; f < freeVars.length; f++) {
                const c = matrix[r][freeVars[f]];
                if (c > 0) { minRhs -= c * maxFree; }
                else { maxRhs -= c * maxFree; }
            }
            // pivot = rhs - coeff*x[idx] - ... >= 0
            if (coeff > 0) {
                maxVal = Math.min(maxVal, Math.floor(maxRhs / coeff + 1e-9));
            } else {
                minVal = Math.max(minVal, Math.ceil(maxRhs / coeff - 1e-9));
            }
        }
        
        if (minVal > maxVal) return;
        
        for (let v = minVal; v <= maxVal; v++) {
            freeVals.push(v);
            search(idx + 1, freeVals);
            freeVals.pop();
        }
    }
    
    search(0, []);
    return best === Infinity ? 0 : best;
}

let result = 0;
for (const line of input) {
    const { buttons, target } = parseLine(line);
    result += solve(buttons, target);
}

console.log(result);
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Board dimensions
const ROWS = 5;
const COLS = 4;

// Define block types and their dimensions
// Updated to match the new layout's block count
const BLOCK_TYPES = {
    1: { width: 2, height: 2, name: 'Master Block' }, // The main 2x2 block (B)
    2: { width: 1, height: 2, name: 'Vertical Block A' }, // (A)
    3: { width: 1, height: 2, name: 'Vertical Block C' }, // (C)
    4: { width: 1, height: 2, name: 'Vertical Block D' }, // (D)
    5: { width: 1, height: 2, name: 'Vertical Block F' }, // (F)
    6: { width: 2, height: 1, name: 'Horizontal Block E' }, // (E)
    7: { width: 1, height: 1, name: 'Small Block G' }, // (G)
    8: { width: 1, height: 1, name: 'Small Block H' }, // (H)
    9: { width: 1, height: 1, name: 'Small Block I' }, // (I)
    10: { width: 1, height: 1, name: 'Small Block J' }, // (J)
};

// Initial state of the puzzle based on the user's new layout
// Each number represents a block ID. 0 represents an empty space.
const INITIAL_BLOCK_POSITIONS = {
    1: { id: 1, row: 0, col: 1 }, // Master Block (B)
    2: { id: 2, row: 0, col: 0 }, // Vertical Block A
    3: { id: 3, row: 0, col: 3 }, // Vertical Block C
    4: { id: 4, row: 2, col: 0 }, // Vertical Block D
    5: { id: 5, row: 2, col: 3 }, // Vertical Block F
    6: { id: 6, row: 2, col: 1 }, // Horizontal Block E
    7: { id: 7, row: 3, col: 1 }, // Small Block G
    8: { id: 8, row: 3, col: 2 }, // Small Block H
    9: { id: 9, row: 4, col: 0 }, // Small Block I
    10: { id: 10, row: 4, col: 3 }, // Small Block J
};

// Goal: Master block (ID 1) should be at row 3, column 1 (bottom center)
const GOAL_MASTER_POS = { row: 3, col: 1 };
const MASTER_BLOCK_ID = 1;

// Add a limit to the number of states visited to prevent memory issues
const MAX_VISITED_STATES = 500000; // Adjust this value as needed for performance vs. solution depth

/**
 * Generates a 2D grid representation of the board based on current block positions.
 * @param {object} blocks - Object containing block IDs as keys and their current {id, row, col} as values.
 * @returns {number[][]} A 2D array representing the board.
 */
const generateGridFromBlocks = (blocks) => {
    const grid = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    for (const blockId in blocks) {
        const block = blocks[blockId];
        const type = BLOCK_TYPES[block.id];
        for (let r = block.row; r < block.row + type.height; r++) {
            for (let c = block.col; c < block.col + type.width; c++) {
                if (r < ROWS && c < COLS) { // Ensure within bounds
                    grid[r][c] = block.id;
                }
            }
        }
    }
    return grid;
};

const keyMap = ['0', '1', '2', '2', '2', '2', '6', '7', '7', '7', '7'];

function gridKey(grid) {
  return grid.flatMap(row => row.map(n => keyMap[n])).join('');
}

/**
 * Represents a puzzle state.
 * @typedef {object} PuzzleState
 * @property {number[][]} grid - The 2D array representing the board.
 * @property {object} blocks - Object containing block IDs as keys and their current {id, row, col} as values.
 * @property {string[]} path - Array of strings describing moves to reach this state.
 */

function App() {
    const [currentBlocks, setCurrentBlocks] = useState(INITIAL_BLOCK_POSITIONS);
    const [currentGrid, setCurrentGrid] = useState([]);
    const [solutionSteps, setSolutionSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isSolving, setIsSolving] = useState(false);
    const [message, setMessage] = useState('');

    // Memoize the initial grid generation
    useEffect(() => {
        setCurrentGrid(generateGridFromBlocks(INITIAL_BLOCK_POSITIONS));
    }, []);

    /**
     * Gets all possible next states from a given puzzle state.
     * @param {PuzzleState} currentState - The current state of the puzzle.
     * @returns {Array<{newBlocks: object, moveDescription: string}>} An array of possible next states.
     */
    const getPossibleMoves = useCallback((currentState) => {
        const possibleMoves = [];
        const currentGrid = currentState.grid;
        const currentBlocks = currentState.blocks;

        for (const blockId in currentBlocks) {
            const block = currentBlocks[blockId];
            const type = BLOCK_TYPES[block.id];

            // Define possible directions: [dr, dc]
            const directions = [[-1, 0, 'up'], [1, 0, 'down'], [0, -1, 'left'], [0, 1, 'right']];

            for (const [dr, dc, directionName] of directions) {
                const newRow = block.row + dr;
                const newCol = block.col + dc;

                // Check if the new position is within board boundaries
                if (newRow < 0 || newRow + type.height > ROWS || newCol < 0 || newCol + type.width > COLS) {
                    continue; // Out of bounds
                }

                // Check if the new cells are empty or currently occupied by this block
                let canMove = true;
                for (let r = newRow; r < newRow + type.height; r++) {
                    for (let c = newCol; c < newCol + type.width; c++) {
                        // If the target cell is occupied by another block, cannot move
                        if (currentGrid[r][c] !== 0 && currentGrid[r][c] !== block.id) {
                            canMove = false;
                            break;
                        }
                    }
                    if (!canMove) break;
                }

                if (canMove) {
                    // Create a deep copy of blocks for the new state
                    const newBlocks = JSON.parse(JSON.stringify(currentBlocks));
                    newBlocks[block.id] = { ...newBlocks[block.id], row: newRow, col: newCol };
                    const newGrid = generateGridFromBlocks(newBlocks);
                    const moveDescription = `${type.name} ${directionName}`;
                    possibleMoves.push({ newBlocks, newGrid, moveDescription });
                }
            }
        }
        return possibleMoves;
    }, []); // Removed isEmpty from dependencies as it's not directly used here

    /**
     * Checks if the current state is the goal state.
     * @param {object} blocks - Current positions of all blocks.
     * @returns {boolean} True if the master block is at the goal position.
     */
    const isGoalState = useCallback((blocks) => {
        const masterBlock = blocks[MASTER_BLOCK_ID];
        return masterBlock.row === GOAL_MASTER_POS.row && masterBlock.col === GOAL_MASTER_POS.col;
    }, []);

    /**
     * Solves the puzzle using Breadth-First Search (BFS).
     */
    const solvePuzzle = useCallback(() => {
        setIsSolving(true);
        setMessage('Solving puzzle... this might take a moment.');
        setSolutionSteps([]);
        setCurrentStepIndex(0);

        const queue = [{
            blocks: INITIAL_BLOCK_POSITIONS,
            grid: generateGridFromBlocks(INITIAL_BLOCK_POSITIONS),
            path: []
        }];
        const visited = new Set();
        visited.add(JSON.stringify(generateGridFromBlocks(INITIAL_BLOCK_POSITIONS)));

        let foundSolution = false;
        let solutionPath = [];

        // Use setTimeout to break up the computation and prevent UI freeze
        const processQueue = () => {
            const startTime = performance.now();
            // Continue processing as long as there are states in the queue,
            // time slice is not exceeded, and visited states are within limit
            while (queue.length > 0 && (performance.now() - startTime < 100) && visited.size < MAX_VISITED_STATES) {
                const { blocks, grid, path } = queue.shift();

                if (isGoalState(blocks)) {
                    foundSolution = true;
                    solutionPath = path;
                    break;
                }

                const moves = getPossibleMoves({ blocks, grid });
                for (const move of moves) {
                    const newBlocks = move.newBlocks;
                    const newGrid = move.newGrid;
                    const newGridString = gridKey(newGrid);

                    if (!visited.has(newGridString)) {
                        visited.add(newGridString);
                        queue.push({
                            blocks: newBlocks,
                            grid: newGrid,
                            path: [...path, move.moveDescription]
                        });
                    }
                }
            }

            console.log(`Visited states: ${visited.size}, Queue size: ${queue.length}`); // For debugging

            if (foundSolution) {
                setSolutionSteps(solutionPath);
                setMessage(`Solution found in ${solutionPath.length} moves!`);
                setCurrentBlocks(INITIAL_BLOCK_POSITIONS); // Reset to initial state for display
                setCurrentGrid(generateGridFromBlocks(INITIAL_BLOCK_POSITIONS));
                setIsSolving(false);
            } else if (queue.length === 0) {
                setMessage('No solution found for this configuration.');
                setIsSolving(false);
            } else if (visited.size >= MAX_VISITED_STATES) {
                setMessage(`Search limit (${MAX_VISITED_STATES} states) reached. No solution found within this limit.`);
                setIsSolving(false);
            }
            else {
                // Continue processing in the next tick
                setTimeout(processQueue, 10);
            }
        };

        processQueue(); // Start the BFS
    }, [getPossibleMoves, isGoalState]);

    // Apply solution step
    useEffect(() => {
        if (solutionSteps.length > 0 && currentStepIndex <= solutionSteps.length) {
            if (currentStepIndex === 0) {
                // Reset to initial state for step 0
                setCurrentBlocks(INITIAL_BLOCK_POSITIONS);
                setCurrentGrid(generateGridFromBlocks(INITIAL_BLOCK_POSITIONS));
            } else {
                let tempBlocks = JSON.parse(JSON.stringify(INITIAL_BLOCK_POSITIONS));
                let tempGrid = generateGridFromBlocks(tempBlocks);

                for (let i = 0; i < currentStepIndex; i++) {
                    const moveDescription = solutionSteps[i];
                    const [blockName, direction] = moveDescription.split(' ');
                    const blockId = Object.keys(BLOCK_TYPES).find(id => BLOCK_TYPES[id].name === blockName);

                    if (!blockId) continue; // Should not happen

                    const block = tempBlocks[blockId];
                    const type = BLOCK_TYPES[block.id];

                    let dr = 0, dc = 0;
                    if (direction === 'up') dr = -1;
                    else if (direction === 'down') dr = 1;
                    else if (direction === 'left') dc = -1;
                    else if (direction === 'right') dc = 1;

                    block.row += dr;
                    block.col += dc;
                    tempBlocks[blockId] = block; // Update the block in tempBlocks
                    tempGrid = generateGridFromBlocks(tempBlocks); // Re-generate grid after each step
                }
                setCurrentBlocks(tempBlocks);
                setCurrentGrid(tempGrid);
            }
        }
    }, [currentStepIndex, solutionSteps]);

    const handleNextStep = () => {
        if (currentStepIndex < solutionSteps.length) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Render the puzzle board
    const renderBoard = useMemo(() => {
        return (
            <div
                className="grid gap-0.5 bg-gray-700 p-1 rounded-lg shadow-lg"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(60px, 1fr))`,
                    gridTemplateRows: `repeat(${ROWS}, minmax(60px, 1fr))`,
                    width: `${COLS * 60 + (COLS -1) * 2 + 8}px`, // Cell size + gap + padding
                    height: `${ROWS * 60 + (ROWS -1) * 2 + 8}px`,
                }}
            >
                {currentGrid.map((row, rIdx) =>
                    row.map((cellId, cIdx) => {
                        // Only render the top-left corner of each block
                        const block = currentBlocks[cellId];
                        if (block && block.row === rIdx && block.col === cIdx) {
                            const type = BLOCK_TYPES[block.id];
                            const isMaster = block.id === MASTER_BLOCK_ID;
                            const isGoalPosition = isMaster && block.row === GOAL_MASTER_POS.row && block.col === GOAL_MASTER_POS.col;

                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    className={`relative rounded-md flex items-center justify-center text-white font-bold text-lg shadow-md transition-all duration-300 ease-in-out
                                                ${isMaster ? 'bg-red-500' : 'bg-blue-500'}
                                                ${isGoalPosition ? 'border-4 border-green-400' : ''}`}
                                    style={{
                                        gridColumn: `${cIdx + 1} / span ${type.width}`,
                                        gridRow: `${rIdx + 1} / span ${type.height}`,
                                        backgroundColor: isMaster ? 'rgb(239 68 68)' : (block.id % 2 === 0 ? 'rgb(59 130 246)' : 'rgb(34 197 94)'), // Alternating colors
                                    }}
                                >
                                    {isMaster && <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold opacity-75">★</span>}
                                    <span className="relative z-10">{block.id}</span>
                                </div>
                            );
                        }
                        // Render empty cells or cells covered by other parts of a block
                        if (cellId === 0) {
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    className="bg-gray-800 rounded-sm"
                                ></div>
                            );
                        }
                        return null; // Don't render cells that are part of a block but not its top-left
                    })
                )}
            </div>
        );
    }, [currentGrid, currentBlocks]);


    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                The Square Root Puzzle
            </h1>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Puzzle Board */}
                {renderBoard}

                {/* Controls and Solution */}
                <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                    <button
                        onClick={solvePuzzle}
                        disabled={isSolving}
                        className={`px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300
                                    ${isSolving ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transform hover:scale-105'}`}
                    >
                        {isSolving ? 'Solving...' : 'Solve Puzzle'}
                    </button>

                    {message && (
                        <p className={`mt-4 text-center md:text-left ${solutionSteps.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {message}
                        </p>
                    )}

                    {solutionSteps.length > 0 && (
                        <div className="mt-6 w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">Solution Steps ({solutionSteps.length})</h2>
                            <div className="flex justify-center items-center gap-4 mb-4">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStepIndex === 0}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-xl font-semibold">
                                    Step {currentStepIndex} / {solutionSteps.length}
                                </span>
                                <button
                                    onClick={handleNextStep}
                                    disabled={currentStepIndex === solutionSteps.length}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto text-sm text-gray-300">
                                {solutionSteps.map((step, index) => (
                                    <p
                                        key={index}
                                        className={`p-2 rounded-md ${index + 1 === currentStepIndex ? 'bg-purple-700 text-white font-medium' : 'hover:bg-gray-700'}`}
                                    >
                                        {index + 1}. {step}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;

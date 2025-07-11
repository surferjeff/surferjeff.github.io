/// The puzzle board is represented as a single string.  Each piece gets a
/// unique letter.  Empty spaces are represented with .
const start = (
    "ABBC" +
    "ABBC" +
    "DEEF" +
    "DGHF" +
    "I..J"
);

/**
 * Pretty prints the board to the console.
 * @param {string} board 
 */
function logBoard(board) {
    const chunks = board.match(/.{1,4}/g) || [];
    for (const chunk of chunks)
        console.log(chunk);
}

/**
 * Enumerates possible moves given the board.
 * @param {string} board - the puzzle board
 * @returns An array of possible moves with the given board state.
 */
function enumerateMoves(board) {
    let empty1 = board.indexOf('.');
    let empty2 = board.indexOf('.', empty1 + 1);
    let result = enumerateMovesFrom(board, empty1);
    result.push(...enumerateMovesFrom(board, empty2));
    return result;
}

/**
 * Enumerates possible moves into an empty space.
 * @param {string} board - the puzzle board
 * @param {number} dotIndex - the index of an empty space in the board
 * @returns An array of possible moves with the given board state.
 */
function enumerateMovesFrom(board, dotIndex) {
    let dotX = dotIndex % 4;
    let result = [];
    if (dotX > 0 && canMove(board, board[dotIndex-1], 1)) {
        result.push({dirName: 'right', step: 1, letter: board[dotIndex-1]});
    }
    if (dotX < 3 && canMove(board, board[dotIndex+1], -1)) {
        result.push({dirName: 'left', step: -1, letter: board[dotIndex+1]});
    }
    if (canMove(board, board[dotIndex - 4], 4)) {
        result.push({dirName: 'down', step: 4, letter: board[dotIndex - 4]});
    }
    if (canMove(board, board[dotIndex + 4], -4)) {
        result.push({dirName: 'up', step: -4, letter: board[dotIndex + 4]});
    }
    return result;
}

/**
 * Determines if the given move is possible.
 * @param {string} board - the puzzle board
 * @param {string} letter - the letter of the piece to be moved
 * @param {number} step - the direction to move the piece.
 * @returns {boolean}
 */
function canMove(board, letter, step) {
    if (!letter || letter === '.') return false;
    for (let i = board.indexOf(letter); i >= 0; i = board.indexOf(letter, i+1)) {
        let adjacent = board[i + step];
        if (adjacent === letter || adjacent === '.') continue;
        return false;
    }
    return true;
}

/**
 * Moves a piece in a board and returns the new board.
 * @param {string} board - the puzzle board
 * @param {string} letter - the letter of the piece to be moved
 * @param {number} step - the direction to move the piece.
 * @returns {string} - a new board
 */
function move(board, letter, step) {
    let result = board;
    let indices = [];
    for (let i = board.indexOf(letter); i >= 0; i = board.indexOf(letter, i+1)) {
        indices.push(i);        
    }
    if (step > 0) {
        indices.reverse();
    }
    for (const i of indices) {
        result = swapChars(result, i, i + step);
    }
    return result;
}

/**
 * Swaps two letters at the given positions in a string.  Returns new string.
 * @param {string} str
 * @param {number} index1 
 * @param {number} index2 
 * @returns {string}
 */
function swapChars(str, index1, index2) {
  // Ensure index1 is always the smaller index for consistent slicing
  if (index1 > index2) {
    [index1, index2] = [index2, index1]; // Swap the indices
  }

  const char1 = str[index1];
  const char2 = str[index2];

  // Construct the new string by concatenating parts
  return (
    str.slice(0, index1) +   // Part before the first index
    char2 +                  // Character from the second index
    str.slice(index1 + 1, index2) + // Part between the two indices
    char1 +                  // Character from the first index
    str.slice(index2 + 1)    // Part after the second index
  );
}

/// Many pieces are identical.  When calculating a signature to avoid
/// re-examining a board, identical pieces map to the same letter.
const sigLetters = {
    A: 'A',
    C: 'A',
    D: 'A',
    F: 'A',
    B: 'B',
    E: 'E',
    G: 'G',
    H: 'G',
    I: 'G',
    J: 'G',
    '.': '.'
};


/**
 * Solves the puzzle.
 * @param {string} start - The starting board
 * @returns - An array of moves.
 */
function solve(start) {
    // Perform a breadth-first-search through the game tree.
    // Implement a double-ended queue with two stacks.
    let pushStack = [];
    let popStack = [ {board: start }];
    let visited = new Set();
    const limit = 100000;
    for (let n = 0; n < limit; ++n) {
        // Get the next board in the queue.
        if (popStack.length === 0) {
            popStack = pushStack.reverse();
            pushStack = [];
        }
        let top = popStack.pop();
        if (!top) {
            throw new Error("No solution!");
        }
        const board = top.board;
        const moves = enumerateMoves(board);
        for (const m of moves) {
            const b = move(board, m.letter, m.step);
            if (/.............BB..BB./.test(b)) {
                // Reverse the linked list so first step is first step.
                const steps = [{board: b, move: m, prev: top}];
                while (top) {
                    steps.push(top);
                    top = top.prev;
                }
                return steps.reverse();
            }
            const signature = b.replace(/./g, match => sigLetters[match]);
            if (!visited.has(signature)) {
                visited.add(signature);
                pushStack.push({board: b, move: m, prev: top});
            }
        }
    }
    throw new Error("Examined", limit, "moves and haven't found a solution!");
}

/**
 * Updates the left and top positions of the div elements representing the board.
 * @param {string} board - the puzzle board.
 */
function renderBoard(board) {
    let rendered = '';
    for (let y = 0; y < 5; ++y) {
        for (let x = 0; x < 4; ++x) {
            const letter = board[y * 4 + x];
            if (!"ABCDEFGHIJ".includes(letter)) continue;
            if (rendered.includes(letter)) continue;
            const el = document.getElementById(letter);
            el.style.left = `${x * 100 + 5}px`;
            el.style.top = `${y * 100 + 5}px`;
            rendered = rendered + letter;
        }
    }
}

/**
 * Solves the puzzle, then animates the solution via div elements.
 */
async function solveIt() {
    document.getElementById("solve-it").style.display = "none";
    const steps = solve(start);
    for (const step of steps.slice(1)) {
        renderBoard(step.board);
        await new Promise(resolve => window.setTimeout(resolve, 700));
    }
    const el = document.getElementById("B");
    el.style.top = "520px";
}

if (typeof(process) !== 'undefined' && process?.versions?.node) {
    // Solve the puzzle, and writes the solution to the console.
    const steps = solve(start);
    for (const [i, step] of steps.entries()) {
        if (step.move) {
            console.log(String(i).padStart(3, " "), "Move", step.move.letter,
                step.move.dirName);
        }
        logBoard(step.board)
        console.log();
    }
}
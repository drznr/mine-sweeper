function findNeigs(idxI, idxJ) {
    var neighbours = [];
    for (let i = (idxI - 1); i <= (idxI + 1); i++) {
        for (let j = (idxJ - 1); j <= (idxJ + 1); j++) {
            if (i < 0 || i >= gBoard.length) continue;
            if (j < 0 || j >= gBoard.length) continue;
            if (i === idxI && j === idxJ) continue;
            
            neighbours.push({i: i, j: j});
        }
    }
    return neighbours;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function findEmptyNeigs(idxI, idxJ) {
    var neighbours = [];
    for (let i = (idxI - 1); i <= (idxI + 1); i++) {
        for (let j = (idxJ - 1); j <= (idxJ + 1); j++) {
            if (i < 0 || i >= gBoard.length) continue;
            if (j < 0 || j >= gBoard.length) continue;
            if (i === idxI && j === idxJ) continue;
            
            if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isShown) neighbours.push({i: i, j: j}); 
        }
    }
    return neighbours;
}

function findSafeCell() {
    var freeCells = [];

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isShown && !cell.isMine && !cell.isMarked) freeCells.push({ i: i, j: j });
        }
    }
    var selectedCell = freeCells[getRandomIntInclusive(0, freeCells.length - 1)];
    
    return selectedCell;
}


// openNeighbours(idxI, idxJ);
// var neigs = findEmptyNeigs(idxI, idxJ);
// while (neigs.length > 0) {
//     for (let i = 0; i < neigs.length; i++) {
//         var neig = gBoard[neigs[i].i][neigs[i].j];
//         if (!neig.minesAroundCount && !neigs.isShown) openNeighbours(neigs[i].i, neigs[i].j);
//         else neigs.splice(i, 1);
//     }
// }
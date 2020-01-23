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
            if (i === idxI && j === idxJ) break;
            
            if (!gBoard[i][j].minesAroundCount) neighbours.push({i: i, j: j});
        }
    }
    return neighbours;
}
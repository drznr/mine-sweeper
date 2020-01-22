'use strict';

// Global variables
var gBoard = [];
var gGame = {
    isOn: false,
    secsPassed: 0,
    shownCount: 0,
    markedCount: 0
}
var gLevels = [
    {
        SIZE: 4,
        MINES: 2
    },
    {
        SIZE: 8,
        MINES: 12
    },
    {
        SIZE: 12,
        MINES: 30
    }
];
const WIN_FACE = '&#x1F60E;';
const GAME_FACE = '&#x1F604;';
const MINE = '&#x1f4a3;';
const FLAG = '&#x1F6A9;';

function initGame() {
    gBoard = buildBoard(gLevels[0]);
    renderBoard(gBoard);

}




function checkGameOver() {
    debugger;
}

function cellMarked(elCell) {
    debugger
}

function cellClicked(elCell, idxI, idxJ) {
    if (gBoard[idxI][idxJ].isMarked || gBoard[idxI][idxJ].isShown) return;
    if (gBoard[idxI][idxJ].isMine) checkGameOver();

    debugger;
}

function renderBoard(board) {
    var strHtml = '';
    var elBoard = document.querySelector('.board');


    for (let i = 0; i < board.length; i++) {
        strHtml += '<tr>';

        for (let j = 0; j < board[0].length; j++) {
            strHtml += `<td class="cell-${i}-${j} ${(board[i][j].isShown) ? '' : 'covered'}"
                        onclick="cellClicked(this, ${i}, ${j})">
                        ${(board[i][j].isShown) ?
                        (board[i][j].isMarked) ? FLAG :
                        (board[i][j].isMine) ? MINE :
                        (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : ' ' :
                        ' '}
                        </td>`;
        }
        strHtml += '</tr>';
    }
    elBoard.innerHTML = strHtml;
}

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;

            cell.minesAroundCount = countNeigs(i, j);
        }
    }
}

function countNeigs(idxI, idxJ) {
    var neigsAmount = 0;

    for (let i = (idxI - 1); i <= (idxI + 1); i++) {
        for (let j = (idxJ - 1); j <= (idxJ + 1); j++) {
            if (i < 0 || i >= gBoard.length) continue;
            if (j < 0 || j >= gBoard.length) continue;
            if (i === idxI && j === idxJ) continue;
            if (gBoard[i][j].isMine) neigsAmount++;
        }
    }
    return neigsAmount;
}

function buildBoard(level) {
    for (let i = 0; i < level.SIZE; i++) {
        gBoard[i] = [];
        for (let j = 0; j < level.SIZE; j++) {
            gBoard[i][j] = makeCell();
        }
    }
    for (let i = 0; i < level.MINES; i++) {
        gBoard[getRandomIntInclusive(0, level.SIZE - 1)][getRandomIntInclusive(0, level.SIZE - 1)].isMine = true;
    }
    setMinesNegsCount(gBoard);
    return gBoard;
}

function makeCell() {
    var newCell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return newCell;
}
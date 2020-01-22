'use strict';

// Global variables
var gBoard = [];
var gIsFirstClick = true;
var gGameInterval = null;
var gGame = {
    isOn: true,
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
var gCurrLevel = gLevels[0];
const WIN_FACE = '😎';
const GAME_FACE = '😀';
const LOSE_FACE = '🤯';
const MINE = '&#x1f4a3;';
const FLAG = '&#x1F6A9;';
const EMPTY = ' ';
const BULB = '&#x1f4a1;';

function initGame() {
    gIsFirstClick = true;
    document.querySelector('.smiley').innerText = GAME_FACE;
    document.querySelector('.timer').classList.remove('visible');
    document.querySelector('.timer').innerText = 0;

    gGame = {
        isOn: true,
        secsPassed: 0,
        shownCount: 0,
        markedCount: 0
    }
    gBoard = buildBoard(gCurrLevel);
    renderBoard(gBoard);
    makeBulbs();
}



function startGameTimer() {
    var elTimerContainer = document.querySelector('.timer');
    var time = 0;

    elTimerContainer.classList.add('visible');

    gGameInterval = setInterval(function () {
        elTimerContainer.innerText = time++;
    }, 1000);
}

function changeGameLevel(elLevel) {
    clearInterval(gGameInterval);
    gBoard = [];
    gCurrLevel = gLevels[+elLevel.dataset.index];
    initGame();
}

function handleHint(idxI, idxJ) {
    gBoard[idxI][idxJ].isHinted = false;
    var neighbours = findNeigs(idxI, idxJ);

    for (let i = 0; i < neighbours.length; i++) {
        gBoard[neighbours[i].i][neighbours[i].j].isShown = true;
    }
    renderBoard(gBoard);

    setTimeout(function () {
        for (let i = 0; i < neighbours.length; i++) {
            gBoard[neighbours[i].i][neighbours[i].j].isShown = false;
        }
        var hintBulbs = document.querySelectorAll('.hint');

        renderBoard(gBoard);
        hintBulbs[hintBulbs.length - 1].remove();

    }, 1000);
}

function markHint() {
    if (!gGame.isOn) return;
    var freeCells = [];

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isShown && !cell.isMine) freeCells.push({ i: i, j: j });
        }
    }
    var selectedCell = freeCells[getRandomIntInclusive(0, freeCells.length - 1)];
    gBoard[selectedCell.i][selectedCell.j].isHinted = true;
    renderBoard(gBoard);
}

function checkGameOver(isDone) {
    var elButton = document.querySelector('.smiley');

    if (!isDone) {
        var emptyCells = (gCurrLevel.SIZE ** 2) - gCurrLevel.MINES;

        if (gGame.markedCount >= gCurrLevel.MINES && gGame.shownCount >= emptyCells) {
            elButton.innerText = WIN_FACE;
            gGame.isOn = false;
            clearInterval(gGameInterval);
        }
    } else {
        elButton.innerText = LOSE_FACE;
        gGame.isOn = false;
        clearInterval(gGameInterval);
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            }
        }
        renderBoard(gBoard);
    }
}

function cellMarked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return;

    if (!gBoard[idxI][idxJ].isMarked) {
        gBoard[idxI][idxJ].isMarked = true;
        elCell.innerText = FLAG;
        renderBoard(gBoard);
        gGame.markedCount++;
        checkGameOver();
    } else {
        gGame.markedCount--;
        gBoard[idxI][idxJ].isMarked = false;
        elCell.innerText = EMPTY;
        renderBoard(gBoard);
    }
}

function cellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return;
    if (gBoard[idxI][idxJ].isMarked || gBoard[idxI][idxJ].isShown) return;
    if (gBoard[idxI][idxJ].isMine) checkGameOver(true);
    if (gBoard[idxI][idxJ].isHinted) handleHint(idxI, idxJ);

    if (gBoard[idxI][idxJ].minesAroundCount) {
        gBoard[idxI][idxJ].isShown = true;
        gGame.shownCount++;
        if (gIsFirstClick) {
            gBoard = populateBoard(gCurrLevel);
            startGameTimer();
        }
        elCell.classList.remove('covered');
        renderBoard(gBoard);
    } else {
        var neighbours = findNeigs(idxI, idxJ);
        for (let i = 0; i < neighbours.length; i++) {
            if (!gBoard[neighbours[i].i][neighbours[i].j].isShown && !gBoard[neighbours[i].i][neighbours[i].j].isMarked && !gBoard[neighbours[i].i][neighbours[i].j].isMine) {
                gGame.shownCount++;
                gBoard[neighbours[i].i][neighbours[i].j].isShown = true;
                var elCell = document.querySelector(`.cell-${neighbours[i].i}-${neighbours[i].j}`);
                if (gIsFirstClick) {
                    gBoard = populateBoard(gCurrLevel);
                    startGameTimer();
                }
                elCell.classList.remove('covered');
                renderBoard(gBoard);
            } 
        }
    }

    checkGameOver();
}

function renderBoard(board) {
    var strHtml = '';
    var elBoard = document.querySelector('.board');


    for (let i = 0; i < board.length; i++) {
        strHtml += '<tr>';

        for (let j = 0; j < board[0].length; j++) {
            strHtml += `<td class="cell-${i}-${j} ${(board[i][j].isShown) ? '' : 'covered'} ${(board[i][j].isHinted) ? 'hinted' : ''}"
                        onclick="cellClicked(this, ${i}, ${j})"
                        oncontextmenu="cellMarked(this, ${i}, ${j})"
                        >
                        ${(board[i][j].isShown) ?
                    (board[i][j].isMine) ? MINE :
                        (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : EMPTY :
                    (board[i][j].isMarked) ? FLAG : EMPTY}
                        </td>`;
        }
        strHtml += '</tr>';
    }
    elBoard.innerHTML = strHtml;
}

function renderCell(idxI, idxJ, symb) {
    var elCell = document.querySelector(`.cell-${idxI}-${idxJ}`);
    debugger;
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

function populateBoard(level) {
    gIsFirstClick = false;
    var minesAmount = level.MINES;

    for (let i = 0; i < minesAmount; i++) {
        var randCell = gBoard[getRandomIntInclusive(0, level.SIZE - 1)][getRandomIntInclusive(0, level.SIZE - 1)];
        if (!randCell.isShown && !randCell.isMine) randCell.isMine = true;
        else minesAmount++;
    }
    setMinesNegsCount(gBoard);
    return gBoard;
}

function buildBoard(level) {
    for (let i = 0; i < level.SIZE; i++) {
        gBoard[i] = [];
        for (let j = 0; j < level.SIZE; j++) {
            gBoard[i][j] = makeCell();
        }
    }
    return gBoard;
}

function makeBulbs() {
    var bulbsContainer = document.querySelector('.hints');
    var strHtml = '';
    for (let i = 0; i < (3 - (bulbsContainer.children.length - 1)); i++) {
        strHtml += `<span class="hint" onclick="markHint()">&#x1f4a1;</span>`;
    }
    bulbsContainer.innerHTML += strHtml;
}

function makeCell() {
    var newCell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isHinted: false
    }
    return newCell;
}
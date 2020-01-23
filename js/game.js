'use strict';

// Global variables
var gBoard = [];
var gIsFirstClick = true;
var gGameInterval = null;
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    lives: 3,
    start: null,
    end: null,
    isDark: false
}
var gLevels = [
    {
        SIZE: 4,
        MINES: 2,
        best: Infinity
    },
    {
        SIZE: 8,
        MINES: 12,
        best: Infinity
    },
    {
        SIZE: 12,
        MINES: 30,
        best: Infinity
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
    clearInterval(gGameInterval);
    setRecords();
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: 3,
        start: null,
        end: null,
        isDark: false
    }
    gBoard = buildBoard(gCurrLevel);
    renderBoard(gBoard);
    makeBulbs();
    makeLives();
}



function startGameTimer() {
    var elTimerContainer = document.querySelector('.timer');
    var time = 1;

    elTimerContainer.classList.add('visible');
    gGame.start = new Date().getTime();
    gGameInterval = setInterval(function () {
        elTimerContainer.innerText = time++;
    }, 1000);
}

function changeGameLevel(elLevel) {
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

function saveRecords() {
    var gameTime = (gGame.end - gGame.start) / 1000;

    switch (gCurrLevel.SIZE) {
        case 4:
            var best = localStorage.getItem('easy');
            if (!best) {
                if (gameTime < gLevels[0].best) {
                    gLevels[0].best = gameTime;
                    document.querySelector('.easy').innerText = gameTime;
                    localStorage.setItem('easy', gameTime);
                }
            } else {
                if (gameTime < best) {
                    gLevels[0].best = gameTime;
                    document.querySelector('.easy').innerText = gameTime;
                    localStorage.setItem('easy', gameTime);
                }
            }
            break;
        case 8:
            var best = localStorage.getItem('med');
            if (!best) {
                if (gameTime < gLevels[1].best) {
                    gLevels[1].best = gameTime;
                    document.querySelector('.med').innerText = gameTime;
                    localStorage.setItem('med', gameTime);
                }
            } else {
                if (gameTime < best) {
                    gLevels[1].best = gameTime;
                    document.querySelector('.med').innerText = gameTime;
                    localStorage.setItem('med', gameTime);
                }
            }
            break;
        case 12:
            var best = localStorage.getItem('hard');
            if (!best) {
                if (gameTime < gLevels[2].best) {
                    gLevels[2].best = gameTime;
                    document.querySelector('.hard').innerText = gameTime;
                    localStorage.setItem('hard', gameTime);
                }
            } else {
                if (gameTime < best) {
                    gLevels[2].best = gameTime;
                    document.querySelector('.hard').innerText = gameTime;
                    localStorage.setItem('hard', gameTime);
                }
            }
            break;
        default:
            break;
    }
}

function checkGameOver(isDone, idxI, idxJ) {
    var elButton = document.querySelector('.smiley');

    if (!isDone) {
        var emptyCells = (gCurrLevel.SIZE ** 2) - gCurrLevel.MINES;

        if (gGame.markedCount >= gCurrLevel.MINES && gGame.shownCount >= emptyCells) {
            elButton.innerText = WIN_FACE;
            gGame.isOn = false;
            clearInterval(gGameInterval);
            gGame.end = new Date().getTime();
            saveRecords();
        }
    } else {
        gGame.lives--;
        if (gGame.lives <= 0) {
            elButton.innerText = LOSE_FACE;
            gGame.isOn = false;
            clearInterval(gGameInterval);
            for (let i = 0; i < gBoard.length; i++) {
                for (let j = 0; j < gBoard[0].length; j++) {
                    if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
                }
            }
            renderBoard(gBoard);
        } else {
            gBoard[idxI][idxJ].isShown = false;
            document.querySelector(`.cell-${idxI}-${idxJ}`).classList.add('covered');
            renderBoard(gBoard);
            return false;
        }
    }
}

function cellMarked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return;

    if (!gBoard[idxI][idxJ].isMarked) {
        gBoard[idxI][idxJ].isMarked = true;
        elCell.innerText = FLAG;
        gGame.markedCount++;
        renderBoard(gBoard);
        checkGameOver();
    } else {
        gGame.markedCount--;
        gBoard[idxI][idxJ].isMarked = false;
        elCell.innerText = EMPTY;
        renderBoard(gBoard);
    }
}
function handleLivesUI() {
    document.querySelector('.life').remove();

    document.querySelector('.board').classList.add('shake');
    setTimeout(function () {
        document.querySelector('.board').classList.remove('shake');
    }, 500);
    renderBoard(gBoard);
}
function cellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return;
    if (gBoard[idxI][idxJ].isMarked || gBoard[idxI][idxJ].isShown) return;
    if (gBoard[idxI][idxJ].isMine) {
        var isOver = checkGameOver(true, idxI, idxJ);
        if (!isOver) {
            gBoard[idxI][idxJ].isMarked = true;
            gGame.markedCount++;
            handleLivesUI();
            return;
        }

    }
    if (gBoard[idxI][idxJ].isHinted) handleHint(idxI, idxJ);



    if (gIsFirstClick) {
        gBoard = populateBoard(gCurrLevel, idxI, idxJ);
        if (gBoard[idxI][idxJ].minesAroundCount) {
            gBoard[idxI][idxJ].isShown = true;
            gGame.shownCount++;
            elCell.classList.remove('covered');
            renderBoard(gBoard);
            startGameTimer();
        } else {
            openNeighbours(idxI, idxJ);
            var newNeigs = findEmptyNeigs(idxI, idxJ);
            while (newNeigs.length) {
                for (let i = 0; i < newNeigs.length; i++) {
                    openNeighbours(newNeigs[i].i, newNeigs[i].j);
                    newNeigs.shift();
                }
            }
            startGameTimer();
        }
    } else {
        if (gBoard[idxI][idxJ].minesAroundCount) {
            gBoard[idxI][idxJ].isShown = true;
            gGame.shownCount++;
            elCell.classList.remove('covered');
            renderBoard(gBoard);
        } else {
            openNeighbours(idxI, idxJ);
            var newNeigs = findEmptyNeigs(idxI, idxJ);
            while (newNeigs.length) {
                for (let i = 0; i < newNeigs.length; i++) {
                    openNeighbours(newNeigs[i].i, newNeigs[i].j);
                    newNeigs.shift();
                }
            }
        }
    }

    checkGameOver();
}

function openNeighbours(idxI, idxJ) { 
    if (!gBoard[idxI][idxJ].isShown) {
        gGame.shownCount += 2; 
        gBoard[idxI][idxJ].isShown = true;
        document.querySelector(`.cell-${idxI}-${idxJ}`).classList.remove('covered');
    } 

    var neighbours = findNeigs(idxI, idxJ);
    for (let i = 0; i < neighbours.length; i++) {
        if (!gBoard[neighbours[i].i][neighbours[i].j].isShown && !gBoard[neighbours[i].i][neighbours[i].j].isMarked && !gBoard[neighbours[i].i][neighbours[i].j].isMine) {
            gGame.shownCount++;
            gBoard[neighbours[i].i][neighbours[i].j].isShown = true;
            var elCell = document.querySelector(`.cell-${neighbours[i].i}-${neighbours[i].j}`);
            elCell.classList.remove('covered');
            renderBoard(gBoard);
        }
    }
    return neighbours;
}

function changeTheme(elImg) {
    gGame.isDark = !gGame.isDark;
    if (elImg.src.includes('light.png')) elImg.src = 'img/dark.png';
    else elImg.src = 'img/light.png';
    document.querySelector('.header').classList.toggle('dark');
    document.querySelector('body').classList.toggle('dark');
    document.querySelector('.board').classList.toggle('dark');
    document.querySelector('.records').classList.toggle('dark');
    document.querySelector('.recs').classList.toggle('dark');
    var cells = document.querySelectorAll('td');
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.toggle('dark');
    }
}

function renderBoard(board) {
    var strHtml = '';
    var elBoard = document.querySelector('.board');


    for (let i = 0; i < board.length; i++) {
        strHtml += '<tr>';

        for (let j = 0; j < board[0].length; j++) {
            strHtml += `<td class="cell-${i}-${j} ${(board[i][j].isShown) ? '' : 'covered'} ${(board[i][j].isHinted) ? 'hinted' : ''} ${(gGame.isDark) ? 'dark' : ''}"
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

function populateBoard(level, idxI, idxJ) {
    gIsFirstClick = false;
    var minesAmount = level.MINES;

    gBoard[idxI][idxJ].isShown = true;

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

function makeLives() {
    var heartsContainer = document.querySelector('.lifes');
    var strHtml = '';
    for (let i = 0; i < (3 - (heartsContainer.children.length - 1)); i++) {
        strHtml += `<span class="life">&#128150;</span>`;
    }
    heartsContainer.innerHTML += strHtml;
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
function setRecords() {
    var levels = ['easy', 'med', 'hard'];
    for (let i = 0; i < levels.length; i++) {
        var record = localStorage.getItem(levels[i]);
        if (record) document.querySelector('.' + levels[i]).innerText = record;
    }
}
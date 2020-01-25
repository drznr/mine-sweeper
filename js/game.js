'use strict';

// Global variables
var gBoard = [];
var gHistory = [];
var gIsFirstClick = true;
var gGameInterval = null;
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    lives: 3,
    start: null,
    end: null,
    isDark: false,
    onHint: false,
    safeClicksCount: 3
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
    document.querySelector('html').style.cursor = "initial";
    document.querySelector('.smiley').innerText = GAME_FACE;
    document.querySelector('.timer').classList.remove('visible');
    document.querySelector('.timer').innerText = 0;
    gHistory = [];
    clearInterval(gGameInterval);
    setRecords();
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: 3,
        start: null,
        end: null,
        isDark: false,
        onHint: false,
        safeClicksCount: 3
    }
    gBoard = buildBoard(gCurrLevel);
    renderBoard(gBoard);
    makeBulbs();
    makeLives();
    makeSafeClicks();
}


function undoMoves() {
    if (!gGame.isOn) return;

    if (gHistory.length > 1) {
        gHistory.pop();
        var lastMove = gHistory[gHistory.length - 1];
        if (gGame.lives != lastMove.gGame.lives) makeLives();
        gBoard = lastMove.gBoard;
        gGame = lastMove.gGame;
    } else {
        initGame();
        return;
    }
    renderBoard(gBoard);
}

function saveBoardsHistory() {
    var newBoard = [];
    for (let i = 0; i < gBoard.length; i++) {
        newBoard[i] = [];
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var newCell = {
                minesAroundCount: cell.minesAroundCount,
                isShown: cell.isShown,
                isMine: cell.isMine,
                isMarked: cell.isMarked
            }
            newBoard[i].push(newCell);
        }
    }
    var newGgame = {
        isOn: gGame.isOn,
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        lives: gGame.lives,
        start: gGame.start,
        end: gGame.end,
        isDark: gGame.isDark,
        onHint: gGame.onHint,
        safeClicksCount: gGame.safeClicksCount
    }
    gHistory.push({ gBoard: newBoard, gGame: newGgame });
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

function makeSafeClicks() {
    var elBtn = document.querySelector('.safe-btn');
    var elBtnNotf = document.querySelector('.safe-notf span');

    elBtn.disabled = false;
    elBtnNotf.innerText = gGame.safeClicksCount;
}

function handleSafeClick(elBtn) {
    if (!gGame.isOn || !gGame.safeClicksCount) return;

    var elClicksNotf = document.querySelector('.safe-notf span');
    gGame.safeClicksCount--;
    elClicksNotf.innerText = gGame.safeClicksCount;
    if (!gGame.safeClicksCount) elBtn.disabled = true;

    var freeCellLoc = findSafeCell();
    if (freeCellLoc) {
        var elFreeCell = document.querySelector(`.cell-${freeCellLoc.i}-${freeCellLoc.j}`);
        elFreeCell.classList.add('hinted');
        setTimeout(function () {
            elFreeCell.classList.remove('hinted');
        }, 3000);
    }
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

function checkGameOver(gotLives, idxI, idxJ) {
    var elButton = document.querySelector('.smiley');

    if (!gotLives) {
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
    saveBoardsHistory();
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
    if (!gGame.isOn || gBoard[idxI][idxJ].isMarked || gBoard[idxI][idxJ].isShown) return;

    if (gGame.onHint) {
        showArea(idxI, idxJ);
        return;
    }

    if (gBoard[idxI][idxJ].isMine) {
        var isOver = checkGameOver(true, idxI, idxJ);
        if (!isOver) {
            handleLivesUI();
            return;
        }
    }

    if (gIsFirstClick) {
        gBoard = populateBoard(gCurrLevel, idxI, idxJ);
        if (gBoard[idxI][idxJ].minesAroundCount) {
            elCell.classList.remove('covered');
            renderBoard(gBoard);
            startGameTimer();
        } else {
            var neigs = findEmptyNeigs(idxI, idxJ);
            openNeighbours(idxI, idxJ);
            expandOpenNeigs(neigs);

            startGameTimer();
        }
    } else {
        if (gBoard[idxI][idxJ].minesAroundCount) {
            gBoard[idxI][idxJ].isShown = true;
            gGame.shownCount++;
            elCell.classList.remove('covered');
            renderBoard(gBoard);
        } else {
            var neigs = findEmptyNeigs(idxI, idxJ);
            openNeighbours(idxI, idxJ);
            expandOpenNeigs(neigs);
        }
    }
    saveBoardsHistory();
    checkGameOver();
}

function expandOpenNeigs(neigs) {
    var newNeigs = [];
    for (let i = 0; i < neigs.length; i++) {
        newNeigs = [...newNeigs, ...findEmptyNeigs(neigs[i].i, neigs[i].j)];
        openNeighbours(neigs[i].i, neigs[i].j);
    }
    if (newNeigs.length) expandOpenNeigs(newNeigs);
}

function openNeighbours(idxI, idxJ) {
    if (!gBoard[idxI][idxJ].isShown) {
        gGame.shownCount++;
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
}

function showArea(idxI, idxJ) {
    var shownCells = [];
    var cell = gBoard[idxI][idxJ];
    var neigsLocations = findNeigs(idxI, idxJ);

    if (!cell.isShown) cell.isShown = true;
    else shownCells.push(cell);
    for (let i = 0; i < neigsLocations.length; i++) {
        var neigCell = gBoard[neigsLocations[i].i][neigsLocations[i].j];
        if (!neigCell.isShown) neigCell.isShown = true;
        else shownCells.push(neigCell);
    }

    setTimeout(function () {
        if (!shownCells.includes(cell)) cell.isShown = false;
        for (let i = 0; i < neigsLocations.length; i++) {
            var neigCell = gBoard[neigsLocations[i].i][neigsLocations[i].j];
            if (!shownCells.includes(neigCell)) neigCell.isShown = false;
        }
        var hintBulbs = document.querySelectorAll('.hint');
        renderBoard(gBoard);
        gGame.onHint = false;
        document.querySelector('html').style.cursor = "initial";
        hintBulbs[hintBulbs.length - 1].remove();
    }, 1000);
    renderBoard(gBoard);
}

function toggleHint() {
    if (!gGame.onHint) document.querySelector('html').style.cursor = "crosshair";
    else document.querySelector('html').style.cursor = "initial";
    gGame.onHint = !gGame.onHint;
}

function handleHints(elCell, idxI, idxJ) {
    if (!gGame.onHint) return;

    var neighbours = findNeigs(idxI, idxJ);

    elCell.classList.add('hinted');
    for (let i = 0; i < neighbours.length; i++) {
        document.querySelector(`.cell-${neighbours[i].i}-${neighbours[i].j}`).classList.add('hinted');
    }

}

function removeHints(elCell, idxI, idxJ) {
    if (!gGame.onHint) return;

    var neighbours = findNeigs(idxI, idxJ);

    elCell.classList.remove('hinted');
    for (let i = 0; i < neighbours.length; i++) {
        document.querySelector(`.cell-${neighbours[i].i}-${neighbours[i].j}`).classList.remove('hinted');
    }

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
            strHtml += `<td class="cell-${i}-${j} cell${board[i][j].minesAroundCount} ${(board[i][j].isShown) ? '' : 'covered'} ${(gGame.isDark) ? 'dark' : ''}"
                        onclick="cellClicked(this, ${i}, ${j})"
                        oncontextmenu="cellMarked(this, ${i}, ${j})"
                        onmouseover="handleHints(this, ${i}, ${j})"
                        onmouseleave="removeHints(this, ${i}, ${j})"
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
    gGame.shownCount++;

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
        strHtml += `<span class="hint" onclick="toggleHint()">&#x1f4a1;</span>`;
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
        isMarked: false
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
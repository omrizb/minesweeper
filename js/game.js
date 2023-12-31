'use strict'

const COLORS = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'grey']
const FLAG = '<img src="./img/flag.png" class="little-image">'
const MINE = '<img src="./img/mine.png" class="little-image">'

const gLevels = [
    { name: 'Beginner', size: 4, mines: 2 },
    { name: 'Intermediate', size: 8, mines: 14 },
    { name: 'Expert', size: 12, mines: 32 }
]
const gCurrLevel = {
    size: 0,
    mines: 0
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    minesLeft: 0,
    secsPassed: 0
}
var gBoard

function onInit(levelName) {
    setCurrLevel(levelName)
    resetGame()
    buildBoard(gCurrLevel.size)
    renderBoard(gBoard)
    updateMinesLeft()
    gGame.isOn = true
}

function setCurrLevel(name) {
    var htmlStr = ''
    for (var i = 0; i < gLevels.length; i++) {
        const currLvl = gLevels[i]
        var currLvlClass = ''
        if (currLvl.name === name) {
            gCurrLevel.size = currLvl.size
            gCurrLevel.mines = currLvl.mines
            currLvlClass = ' currLevel'
        }

        htmlStr += `<span class="level${currLvlClass}" onclick="onInit('${currLvl.name}')">${currLvl.name}</span> | `
    }
    
    htmlStr = htmlStr.slice(0, htmlStr.lastIndexOf(' |'))
    
    const elLevels = document.querySelector('.levels')
    elLevels.innerHTML = htmlStr
}

function resetGame() {
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.minesLeft = 0
    gGame.secsPassed = 0
}

function buildBoard(size) {
    gBoard = []
    for (var i = 0; i < size; i++) {
        gBoard[i] = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell
        }
    }

    var randCells = getRandomCells(gBoard, gCurrLevel.mines)
    for (var randCell of randCells) {
        gBoard[randCell.i][randCell.j].isMine = true
    }
    // gBoard[1][1].isMine = true
    // gBoard[2][3].isMine = true

    setMinesNegsCount(gBoard)
}

function updateMinesLeft() {
    const minesLeft = gCurrLevel.mines - gGame.markedCount
    gGame.minesLeft = minesLeft
    const elMinesLeft = document.querySelector('.mines-left')
    elMinesLeft.textContent = minesLeft
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countMinesAroundCell(board, i, j)
        }
    }
}

function countMinesAroundCell(board, rowIdx, colIdx) {
    var minesCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) minesCount++
        }
    }
    return minesCount
}

function renderBoard(board) {
    var innerHtml = ''
    for (var i = 0; i < board.length; i++) {
        innerHtml += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            innerHtml += `<td class="cell" onclick="onCellClick(this, ${i}, ${j})" oncontextmenu="return onCellMarked(this, ${i}, ${j})" data-i="${i}" data-j="${j}"></td>`
        }
        innerHtml += '</tr>'
    }

    var elBoard = document.querySelector('.board-container tbody')
    elBoard.innerHTML = innerHtml
}

function checkGameOver(elCell, i, j) {
    if (gBoard[i][j].isMine) {
        elCell.classList.add('red-background')
        finishGame()
        return true
    }
    else if (gGame.shownCount === Math.pow(gCurrLevel.size, 2) - gCurrLevel.mines) {
        console.log('WIN!')
        finishGame()
        return true
    }
    return false
}

function finishGame() {
    gGame.isOn = false
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isMine && !cell.isMarked) elCell.innerHTML = MINE
        }
    }
}


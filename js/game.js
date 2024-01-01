'use strict'

const COLORS = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'grey']
const FLAG = '<img src="./img/flag.png" class="little-image">'
const MINE = '<img src="./img/mine.png" class="little-image">'
const LIVE = '💛'
const SMILEY = '🙂'
const MOUSE_DOWN_SMILEY = '😯'
const WIN_SMILEY = '😎'
const LOSE_SMILEY = '🤯'

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
    livesLeft: 0,
    startTime: 0
}
var gTimeInterval
var gBoard

function onInit(levelName) {
    document.addEventListener('mousedown', handleSmileyDown )
    document.addEventListener('mouseup', handleSmileyUp )
    setCurrLevel(levelName)
    setSmiley('smiley')
    resetGame()
    resetLives()
    resetTimer()
    renderBoard()
    updateMinesLeft()
    gGame.isOn = true
}

function setCurrLevel(name = '') {
    if (name === '') return
    var htmlStr = ''
    for (var i = 0; i < gLevels.length; i++) {
        const currLvl = gLevels[i]
        var currLvlClass = ''
        if (currLvl.name === name) {
            gCurrLevel.size = currLvl.size
            gCurrLevel.mines = currLvl.mines
            currLvlClass = ' header-highlight'
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
    gGame.livesLeft = 3
    gGame.startTime = 0
    gBoard = []
}

function buildBoard(size, firstCell) {
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

    var randCells = getRandomCells(gBoard, gCurrLevel.mines, [firstCell])
    for (var randCell of randCells) {
        gBoard[randCell.i][randCell.j].isMine = true
    }

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

function renderBoard() {
    var innerHtml = ''
    for (var i = 0; i < gCurrLevel.size; i++) {
        innerHtml += '<tr>'
        for (var j = 0; j < gCurrLevel.size; j++) {
            innerHtml += `<td class="cell cell-border-2" onclick="onCellClick(this, ${i}, ${j})" oncontextmenu="return onCellMarked(this, ${i}, ${j})" data-i="${i}" data-j="${j}"></td>`
        }
        innerHtml += '</tr>'
    }

    var elBoard = document.querySelector('.board-container tbody')
    elBoard.innerHTML = innerHtml
}

function resetLives() {
    var livesStr = ''
    for (var i = 0; i < gGame.livesLeft; i++) {
        livesStr += LIVE + ' '
    }
    const elLives = document.querySelector('.lives')
    elLives.innerHTML = livesStr
}

function startTime() {
    gGame.startTime = Date.now()
    gTimeInterval = setInterval(updateTime, 37)
}

function stopTime() {
    clearInterval(gTimeInterval)
}

function updateTime() {
    const timeDiff = Date.now() - gGame.startTime
    const elTime = document.querySelector('.time')
    elTime.textContent = getTimeStr(timeDiff)
}

function resetTimer() {
    stopTime()
    const elTime = document.querySelector('.time')
    elTime.textContent = getTimeStr(0)
}

function setSmiley(smiley = undefined) {
    var htmlSmiley = SMILEY
    if (smiley === 'down') htmlSmiley = MOUSE_DOWN_SMILEY
    else if (smiley === 'win') htmlSmiley = WIN_SMILEY
    else if (smiley === 'lose') htmlSmiley = LOSE_SMILEY
    const elSmiley = document.querySelector('.board-header-smiley')
    elSmiley.textContent = htmlSmiley
}

function checkGameOver(elCell, i, j) {
    if (gBoard[i][j].isMine) {
        elCell.classList.add('red-background')
        setSmiley('lose')
        finishGame()
        return true
    }
    else if (gGame.shownCount === Math.pow(gCurrLevel.size, 2) - gCurrLevel.mines) {
        setSmiley('win')
        finishGame()
        return true
    }
    return false
}

function finishGame() {
    gGame.isOn = false
    stopTime()
    document.removeEventListener('mousedown', handleSmileyDown )
    document.removeEventListener('mouseup', handleSmileyUp )
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isMine && !cell.isMarked) elCell.innerHTML = MINE
        }
    }
}

function handleSmileyDown() {
    setSmiley('down')
}

function handleSmileyUp() {
    setSmiley()
}

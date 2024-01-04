'use strict'

function getRandomCellsForMines(board, len, exclude) {
    const cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (exclude.find(cell => cell.i === i && cell.j === j)) continue
            cells.push({ i, j })
        }
    }

    return drawRandomCells(cells, len)
}

function getRandomSafeCell(board) {
    const cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown && !board[i][j].isMine) cells.push({ i, j })
        }
    }

    return drawRandomCells(cells, 1)[0]
}

function getRandomMineNotShownCells(board, len) {
    const cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (!cell.isShown && !cell.isMarked && cell.isMine) cells.push({ i, j })
        }
    }

    return drawRandomCells(cells, len)
}

function drawRandomCells(cells, len) {
    const randCells = []
    for (var i = 0; i < len; i++) {
        var randIdx = getRandomInt(0, cells.length)
        var randCell = cells.splice(randIdx, 1)[0]
        randCells.push(randCell)
    }
    return randCells
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getTimeStr(msec) {
    const sec = Math.floor(msec / 1000)
    return (sec <= 999) ? String(sec).padStart(3, '0') : '999'
}

function addClassToAllCells(className) {
    const elCells = document.querySelectorAll('.cell')
    elCells.forEach(cell => cell.classList.add(className))
}

function removeClassFromAllCells(className) {
    const elCells = document.querySelectorAll('.cell')
    elCells.forEach(cell => cell.classList.remove(className))
}

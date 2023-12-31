'use strict'

function getRandomCells(board, len) {
    const cells = []
    const randCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            cells.push({ i, j })
        }
    }

    for (i = 0; i < len; i++) {
        var randIdx = getRandomInt(0, cells.length)
        var randCell = cells.splice(randIdx, 1)[0]
        randCells.push(randCell)
    }

    return randCells
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

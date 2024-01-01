'use strict'

function onCellClick(elCell, i, j) {
    if (gBoard.length === 0) {
        buildBoard(gCurrLevel.size, { i, j })
        startTime()
    }

    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return

    showCell(elCell, i, j)

    checkGameOver(elCell, i, j)
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn || gBoard.length === 0) return false

    var cell = gBoard[i][j]
    if (cell.isShown) return false

    var innerHTML = ''
    if (!cell.isMarked) {
        if (gGame.minesLeft === 0) return false
        gGame.markedCount++
        elCell.classList.add('orange-background')
        innerHTML = FLAG
    } else {
        elCell.classList.remove('orange-background')
        gGame.markedCount--
    }

    cell.isMarked = !cell.isMarked

    updateMinesLeft()

    elCell.innerHTML = innerHTML
    return false
}

function showCell(elCell, i, j) {
    gGame.shownCount++

    var cell = gBoard[i][j]
    cell.isShown = true
    elCell.classList.add('shown-cell')
    elCell.classList.remove('cell-border-2')
    elCell.style.color = COLORS[cell.minesAroundCount - 1]

    if (cell.isMine) elCell.innerHTML = MINE
    else if (cell.minesAroundCount > 0) elCell.textContent = cell.minesAroundCount
    else expandShown(gBoard, i, j)
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isShown || board[i][j].isMarked) continue

            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            showCell(elCell, i, j)
        }
    }
}
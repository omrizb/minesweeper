'use strict'

function onCellClick(elCell, i, j) {
    if (gBoard.length === 0) {
        buildBoard(gCurrLevel.size, { i, j })
        setButtonsState(true)
        startTime()
    }

    if (elCell.classList.contains('reveal')) {
        revealHintHandler()
        return
    }

    if (elCell.classList.contains('mega-hint')) {
        megaHintHandler(elCell)
        return
    }

    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return

    showCell(elCell, i, j)

    checkGameOver(i, j)
}

function onCellOver(elCell, rowIdx, colIdx) {
    if (!gGame.isOn || gBoard.length === 0) return
    if (elCell.classList.contains('reveal')) onCellOverForHint(rowIdx, colIdx)
    if (elCell.classList.contains('mega-hint')) onCellOverForMega(elCell)
}

function onCellOverForHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCurrCell.classList.add('mark-for-reveal')
        }
    }
}

function onCellOverForMega(elCell) {
    elCell.classList.add('mark-for-mega')
}

function onCellOut(elCell, rowIdx, colIdx) {
    if (!gGame.isOn || gBoard.length === 0) return
    if (elCell.classList.contains('reveal')) onCellOutForHint(rowIdx, colIdx)
    if (elCell.classList.contains('mega-hint')) onCellOutForMega(elCell)
}

function onCellOutForHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCurrCell.classList.remove('mark-for-reveal')
        }
    }
}

function onCellOutForMega(elCell) {
    elCell.classList.remove('mark-for-mega')
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
    var cell = gBoard[i][j]
    if (cell.isShown) {}
    else if (!cell.isMine) gGame.shownCount++
    else {
        gGame.exposedMines++
        updateMinesLeft()
    }

    cell.isShown = true
    elCell.classList.add('shown-cell')
    elCell.classList.remove('cell-border-2')
    elCell.style.color = COLORS[cell.minesAroundCount - 1]

    if (cell.isMine) {
        elCell.classList.add('red-background')
        elCell.innerHTML = MINE
    }
    else if (cell.minesAroundCount > 0) elCell.textContent = cell.minesAroundCount
    else {
        elCell.textContent = ''
        expandShown(gBoard, i, j)
    }
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

function onHintClick() {
    if (gGame.hintsLeft <= 0) return
    addClassToAllCells('reveal')
    updateHints(1)
}

function onSafeClickClick() {
    if (gGame.safeClicksLeft <= 0) return

    var randSafeCell = getRandomSafeCell(gBoard)
    var elCell = document.querySelector(`[data-i="${randSafeCell.i}"][data-j="${randSafeCell.j}"]`)
    elCell.classList.add('cell-hinted')

    setTimeout(() => {
        elCell.classList.remove('cell-hinted')
    }, 3000)

    updateSafeClicks(1)
}

function onMegaHintClick() {
    if (gGame.megaHintsLeft <= 0) return
    addClassToAllCells('mega-hint')
    updateMegaHins(1)
}

function onExterminateClick() {
    if (gGame.exterminatesLeft <=0) return

    var mineCells = getRandomMineNotShownCells(gBoard, 3)
    for (var mine of mineCells) {
        if (mine === undefined) continue
        var cell = gBoard[mine.i][mine.j]
        cell.isMine = false
        gGame.destroyedMines++
    }

    updateMinesLeft()
    setMinesNegsCount(gBoard)
    updateExterminates(1)
}

function setButtonsState(isEnabled) {
    const elButtons = document.querySelectorAll('.dynamic-state')
    elButtons.forEach(button => {
        if (isEnabled) {
            button.removeAttribute('disabled')
            button.classList.add('hint-btn-active')
        } else {
            button.setAttribute('disabled', '')
            button.classList.remove('hint-btn-active')
        }
    })
}

function revealHintHandler() {
    const elCells = document.querySelectorAll('.mark-for-reveal')
    elCells.forEach(elCell => {
        var cell = gBoard[elCell.dataset.i][elCell.dataset.j]
        if (cell.isShown) return
        setCellForTempShow(cell, elCell)
    })

    setTimeout(() => {
        removeClassFromAllCells('mark-for-reveal')
    }, 2000)

    removeClassFromAllCells('reveal')
}

function megaHintHandler(elCellCorner1) {
    const elMegaCells = document.querySelectorAll('.mark-for-mega-marked')
    if (elMegaCells.length === 0) {
        elCellCorner1.classList.add('mark-for-mega-marked')
        return
    }

    var elCellCorner2 = document.querySelector('.mark-for-mega-marked')
    var cell1 = { i: +elCellCorner1.dataset.i, j: +elCellCorner1.dataset.j }
    var cell2 = { i: +elCellCorner2.dataset.i, j: +elCellCorner2.dataset.j }

    for (var i = Math.min(cell1.i, cell2.i); i <= Math.max(cell1.i, cell2.i); i++) {
        for (var j = Math.min(cell1.j, cell2.j); j <= Math.max(cell1.j, cell2.j); j++) {
            var currCell = gBoard[i][j]
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCurrCell.classList.add('mark-for-mega-marked')

            if (currCell.isShown) continue
            setCellForTempShow(currCell, elCurrCell)
        }
    }

    setTimeout(() => {
        removeClassFromAllCells('mark-for-mega')
        removeClassFromAllCells('mark-for-mega-marked')
    }, 2000)

    removeClassFromAllCells('mega-hint')
}

function setCellForTempShow(cell, elCell) {
    elCell.classList.add('shown-cell')
    elCell.classList.remove('cell-border-2')
    elCell.style.color = COLORS[cell.minesAroundCount - 1]

    if (cell.isMine) elCell.innerHTML = MINE
    else if (cell.minesAroundCount > 0) elCell.textContent = cell.minesAroundCount

    setTimeout(() => {
        if (cell.isShown) return
        elCell.classList.remove('shown-cell')
        elCell.classList.add('cell-border-2')
        if (cell.isMarked) {
            elCell.style.color = 'black'
            elCell.innerHTML = FLAG
            return
        }
        elCell.style.color = 'black'
        elCell.textContent = ''
    }, 2000)
}
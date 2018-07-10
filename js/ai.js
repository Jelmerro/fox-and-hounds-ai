"use strict"
/* global board Board Hound Fox notify */

/* eslint-disable-next-line no-unused-vars */
function mainAILoop() {
    // This is the main loop for the AI functionality.
    const delay = document.getElementById("controls-ai-speed").value
    if (isNaN(delay) || delay.trim() === "") {
        setTimeout(mainAILoop, 100)
    } else if (Number(delay) <= 1000 && Number(delay) > 0) {
        setTimeout(mainAILoop, Number(delay))
    } else {
        setTimeout(mainAILoop, 100)
    }
    if (document.getElementById("controls-toggle-pause").checked) {
        return
    }
    if (board.gameover) {
        return
    }
    nextAIMove(false)
}

function nextAIMove(manual=true) {
    // If this function is called automatically,
    // it should only make the next move if the AI is enabled.
    // If this function is called manually, it should move regardless.
    const foxEnabled = document.getElementById("controls-ai-fox").checked
    const houndEnabled = document.getElementById("controls-ai-hounds").checked
    if (board.currentTurn === "fox" && (manual || foxEnabled)) {
        foxAI.makeMove()
    } else if (board.currentTurn === "hound" && (manual || houndEnabled)) {
        houndAI.makeMove()
    }
}

class AI {
    // Super class for the AI, implements the algorithms for both AI subclasses
    constructor() {
        this.name = ""
    }

    makeMove() {
        const controlsId = `controls-ai-algorithm-${this.name}`
        const algorithm = document.getElementById(controlsId)
        if (algorithm.selectedIndex === 0) {
            this.random()
        } else {
            const depthId = `minimax-depth-${this.name}`
            const depth = document.getElementById(depthId).value
            if (isNaN(depth) || Number(depth) < 1 || Number(depth) > 6) {
                const notes = document.getElementById("notifications")
                if (notes.childNodes.length === 0) {
                    notify("error", "Invalid depth")
                }
                return
            } else {
                this.evaluateMinimax(board, depth, true)
            }
        }
    }

    minimaxMode() {
        const biasedId = `minimax-mode-${this.name}-biased`
        const averageId = `minimax-mode-${this.name}-average`
        if (document.getElementById(biasedId).checked) {
            return "biased"
        } else if (document.getElementById(averageId).checked) {
            return "average"
        }
        return "pure"
    }

    random() {
        // Selects a random animal of the correct name and makes a random move
        // This algorithm gives around 1:9.5 win ratio in favor of the fox
        // Usually because the hounds run out of moves eventually
        const animals = []
        board.animals.forEach(animal => {
            if (animal.name === this.name) {
                animals.push(animal)
            }
        })
        let chosenAnimal = animals[Math.floor(Math.random() * animals.length)]
        let moves = chosenAnimal.possibleMoves()
        while (moves.length === 0) {
            chosenAnimal = animals[Math.floor(Math.random() * animals.length)]
            moves = chosenAnimal.possibleMoves()
        }
        const chosenMove = moves[Math.floor(Math.random() * moves.length)]
        chosenAnimal.moveTo(chosenMove.x, chosenMove.y)
    }

    terminalScore(boardState) {
        const victory = boardState.checkVictory(false)
        if (victory === "") {
            return 0
        }
        if (victory === this.name) {
            return 100
        } else {
            return -100
        }
    }

    cloneBoard(boardState) {
        const animals = []
        boardState.animals.forEach(animal => {
            if (animal.name === "fox") {
                animals.push(new Fox(animal.x, animal.y))
            } else if (animal.name === "hound") {
                animals.push(new Hound(animal.x, animal.y))
            }
        })
        return new Board(animals, boardState.currentTurn)
    }

    average(scores) {
        let total = 0
        scores.forEach(score => {
            total += score
        })
        return total / scores.length
    }

    evaluateMinimax(currentBoard, depth, root=false) {
        const animals = []
        currentBoard.animals.forEach(animal => {
            if (animal.name === currentBoard.currentTurn) {
                animals.push(animal)
            }
        })
        if (root) {
            let highestSoFar = -1000
            let bestAnimal = null
            let bestMove = null
            let averageScoreOfBestMove
            animals.forEach(animal => {
                const moves = animal.possibleMoves(currentBoard)
                moves.forEach(move => {
                    const newBoard = this.cloneBoard(currentBoard)
                    newBoard.animalAt(animal.x, animal.y)
                        .moveTo(move.x, move.y, newBoard)
                    const scores = this.evaluateMinimax(newBoard, depth - 1)
                    if (this.minimaxMode() === "pure") {
                        if (scores.lowest > highestSoFar) {
                            highestSoFar = scores.lowest
                            bestAnimal = animal
                            bestMove = move
                        }
                    } else if (this.minimaxMode() === "biased") {
                        if (scores.lowest > highestSoFar) {
                            highestSoFar = scores.lowest
                            bestAnimal = animal
                            bestMove = move
                            averageScoreOfBestMove = this.average(scores.all)
                        } else if (scores.lowest === highestSoFar) {
                            const averageThisMove = this.average(scores.all)
                            if (averageThisMove > averageScoreOfBestMove) {
                                bestAnimal = animal
                                bestMove = move
                                averageScoreOfBestMove = averageThisMove
                            }
                        }
                    } else if (this.minimaxMode() === "average") {
                        if (this.average(scores.all) > highestSoFar) {
                            highestSoFar = this.average(scores.all)
                            bestAnimal = animal
                            bestMove = move
                        }
                    }
                })
            })
            bestAnimal.moveTo(bestMove.x, bestMove.y)
            return
        } else if (depth === 0 || this.terminalScore(currentBoard) !== 0) {
            return {
                lowest: this.evaluateScore(currentBoard),
                all: [this.evaluateScore(currentBoard)]
            }
        } else {
            let lowestScore = 1000
            const allScores = []
            animals.forEach(animal => {
                const moves = animal.possibleMoves(currentBoard)
                moves.forEach(move => {
                    const newBoard = this.cloneBoard(currentBoard)
                    newBoard.animalAt(animal.x, animal.y)
                        .moveTo(move.x, move.y, newBoard)
                    const scores = this.evaluateMinimax(newBoard, depth - 1)
                    if (scores.lowest < lowestScore) {
                        lowestScore = scores.lowest
                    }
                    allScores.push(...scores.all)
                })
            })
            return {
                lowest: lowestScore,
                all: allScores
            }
        }
    }
}

class FoxAI extends AI {
    constructor() {
        super()
        this.name = "fox"
    }

    evaluateScore(boardState) {
        let score = 0
        // Motivate the fox to move to the top of the board
        boardState.animals.forEach(animal => {
            if (animal.name === "fox") {
                score = -animal.y * 2
            }
        })
        // Make losing a no go if possible
        // and winning top priority
        score += this.terminalScore(boardState)
        return score
    }
}

class HoundAI extends AI {
    constructor() {
        super()
        this.name = "hound"
    }

    evaluateScore(boardState) {
        let score = 0
        let fox = null
        const hounds = []
        boardState.animals.forEach(animal => {
            if (animal.name === "fox") {
                fox = animal
            } else {
                hounds.push(animal)
            }
        })
        score += fox.y * 3
        // Let the hounds keep roughly the same y axis
        let highestHound = -10
        let lowestHound = 20
        hounds.forEach(hound => {
            if (hound.y > highestHound) {
                highestHound = hound.y
            } else if (hound.y < lowestHound) {
                lowestHound = hound.y
            }
        })
        score -= (highestHound - lowestHound) * 2
        // Make sure the fox does not get above the hounds
        // As this means the game is lost
        if (fox.y <= lowestHound) {
            score -= 50
        }
        // Lower the score when the hounds are on average not above the fox
        let totalWidth = 0
        hounds.forEach(hound => {
            totalWidth += hound.x
        })
        const averageXPosition = totalWidth / hounds.length
        score -= Math.abs(averageXPosition - fox.x)
        // Make sure there are no gaps between the hounds
        // -1 and 8 are the "walls", where gaps are also discouraged
        const xPositions = []
        hounds.forEach(hound => {
            xPositions.push(hound.x)
        })
        xPositions.push(-1)
        xPositions.push(8)
        xPositions.sort((a, b) => {return a-b})
        let biggestGap = 0
        for (let i = 0; i < xPositions.length -1; i++) {
            const gap = xPositions[i+1] - xPositions[i]
            if (gap > biggestGap) {
                biggestGap = gap
            }
        }
        if (biggestGap > 4) {
            score -= 10
        }
        // Make losing a no go if possible
        // and winning top priority
        score += this.terminalScore(boardState)
        return score
    }
}

const foxAI = new FoxAI()
const houndAI = new HoundAI()

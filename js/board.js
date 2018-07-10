"use strict"
/* global notify nationalName */

let board

class Board {
    constructor(animals, firstTurn="fox") {
        this.animals = animals
        this.currentTurn = firstTurn
        this.focussedAnimal = null
        this.gameover = false
    }

    isValidMove(animal, x, y) {
        // Checks if a given move is valid for the animal object provided.
        // All failing scenarios are checked, before returning true.
        // First failure is if the new position is the same as the old position
        if (animal.x === x && animal.y === y) {
            return false
        }
        // Second failure is when a hound tries to move back up to a higher row
        if (animal.name === "hound" && y <= animal.y) {
            return false
        }
        // Third faulure is if the move is not a diagonal tile on the x axis
        if (animal.x + 1 !== x && animal.x - 1 !== x) {
            return false
        }
        // Fourth faulure is if the move is not a diagonal tile on the y axis
        if (animal.y + 1 !== y && animal.y - 1 !== y) {
            return false
        }
        // Fifth failure is if the new location is outside of the playing field
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return false
        }
        // Final check is to make sure there is no other animal already there
        let allGood = true
        this.animals.forEach(a => {
            if (x === a.x && y === a.y) {
                allGood = false
            }
        })
        return allGood
    }

    animalAt(x, y) {
        // Finds an animal for a location provided
        let foundAnimal = null
        this.animals.forEach(animal => {
            if (animal.x === x && animal.y === y) {
                foundAnimal = animal
            }
        })
        return foundAnimal
    }

    possibleMoves(animalName) {
        // Makes a list of the possible moves for a type of animal
        let validMoves = []
        this.animals.forEach(animal => {
            if (animal.name === animalName) {
                validMoves = validMoves.concat(animal.possibleMoves())
            }
        })
        return validMoves
    }

    checkVictory(register=true) {
        // After each move this function is called to check if the game is over:
        // Ffirst it checks if the fox is closed in, which means a hounds win.
        // Secondly it checks if the hounds are stuck, meaning the fox wins.
        // Lastly is checks if the fox has reached the top row of the board,
        // which results in a win for the fox.
        // the board is reset to the startup state and a new game can begin
        if (this.possibleMoves("fox").length === 0) {
            if (register) {
                notify("info", `${nationalName("hound", true)} win!`)
                this.addVictory("hound")
            }
            return "hound"
        } else if (this.possibleMoves("hound").length === 0) {
            if (register) {
                notify("info", `${nationalName("fox", true)} wins!`)
                this.addVictory("fox")
            }
            return "fox"
        } else {
            this.animals.forEach(animal => {
                if (animal.name === "fox" && animal.y === 0) {
                    if (register) {
                        notify("info", `${nationalName("fox", true)} wins!`)
                        this.addVictory("fox")
                    }
                    return "fox"
                }
            })
        }
        return ""
    }

    addVictory(animal) {
        // Update the win counter for the winning animal
        this.gameover = true
        const ourCounter = document.getElementById(`win-${animal}`)
        const ourWins = Number(ourCounter.innerHTML) + 1
        ourCounter.innerHTML = ourWins
        this.calculateVictoryRatio()
        if (document.getElementById("controls-show-gameover").checked) {
            setTimeout(generateNewBoard, 1000)
        } else {
            generateNewBoard()
        }
    }

    calculateVictoryRatio() {
        // Calculate a new win ratio
        const foxCounter = document.getElementById("win-fox")
        const foxWins = Number(foxCounter.innerHTML)
        const houndCounter = document.getElementById("win-hound")
        const houndWins = Number(houndCounter.innerHTML)
        const ratioElement = document.getElementById("win-ratio")
        if (foxWins === 0 || houndWins === 0) {
            return
        }
        if (foxWins > houndWins) {
            const ratio = foxWins / houndWins
            if (ratio !== Math.floor(ratio)) {
                ratioElement.innerText = `1:${ratio.toFixed(2)}`
            } else {
                ratioElement.innerText = `1:${ratio}`
            }
        } else if (houndWins > foxWins) {
            const ratio = houndWins / foxWins
            if (ratio !== Math.floor(ratio)) {
                ratioElement.innerText = `${ratio.toFixed(2)}:1`
            } else {
                ratioElement.innerText = `${ratio}:1`
            }
        } else {
            ratioElement.innerText = "1:1"
        }
    }
}

class Animal {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.name = ""
    }

    moveTo(x, y, place=board) {
        // Moves the animal to the specified location if this is a valid move,
        // or if the user has enabled invalid moves
        if (this.name !== place.currentTurn || place.gameover) {
            return
        }
        const checkbox = document.getElementById("controls-allow-invalid")
        const allowInvalidMoves = checkbox.checked
        if (place.isValidMove(this, x, y) || allowInvalidMoves) {
            this.x = x
            this.y = y
            place.currentTurn = place.currentTurn === "fox" ? "hound" : "fox"
            place.focussedAnimal = null
            if (place === board) {
                updateBoard()
                board.checkVictory()
            }
        } else {
            notify("warn", "Invalid move")
        }
    }
}

class Hound extends Animal {
    // There are always 4 hounds (or Sheep) on the board
    constructor(x, y) {
        super(x, y)
        this.name = "hound"
    }

    possibleMoves(place=board) {
        // Returns all possible moves for this hound
        const allMoves = [
            {
                x: this.x + 1,
                y: this.y + 1
            },
            {
                x: this.x - 1,
                y: this.y + 1
            }
        ]
        const validMoves = []
        allMoves.forEach(move => {
            if (place.isValidMove(this, move.x, move.y)) {
                validMoves.push(move)
            }
        })
        return validMoves
    }
}
class Fox extends Animal {
    // There will always be one fox (or Wolf) on the board.
    constructor(x, y) {
        super(x, y)
        this.name = "fox"
    }

    possibleMoves(place=board) {
        // Returns all possible moves for the fox
        const allMoves = [
            {
                x: this.x + 1,
                y: this.y + 1
            },
            {
                x: this.x - 1,
                y: this.y + 1
            },
            {
                x: this.x + 1,
                y: this.y - 1
            },
            {
                x: this.x - 1,
                y: this.y - 1
            }
        ]
        const validMoves = []
        allMoves.forEach(move => {
            if (place.isValidMove(this, move.x, move.y)) {
                validMoves.push(move)
            }
        })
        return validMoves
    }
}

function generateNewBoard() {
    // This function resets the board to the default state
    board = new Board([
        new Fox(0, 7),
        new Hound(1, 0),
        new Hound(3, 0),
        new Hound(5, 0),
        new Hound(7, 0)
    ])
    updateBoard()
}

function updateBoard() {
    // This function generates the board as html from the board object
    // It also adds the listeners to handle user interaction
    const boardElement = document.getElementById("board")
    boardElement.innerHTML = `<div id="animals"></div>`
    if (document.getElementById("controls-rotate-board").checked) {
        if (board.currentTurn === "hound") {
            boardElement.className = "rotated"
        } else {
            boardElement.className = ""
        }
    } else {
        boardElement.className = ""
    }
    let squareColor = "white"
    for (let i = 0; i < 64; i++) {
        const square = document.createElement("span")
        square.className = `${squareColor}-square`
        if (squareColor === "black") {
            square.onclick = () => {
                if (board.focussedAnimal !== null) {
                    board.focussedAnimal.moveTo(i % 8, Math.floor(i / 8))
                }
            }
        }
        boardElement.appendChild(square)
        squareColor = squareColor === "black" ? "white" : "black"
        if ((i + 1 )% 8 === 0) {
            boardElement.appendChild(document.createElement("br"))
            squareColor = squareColor === "black" ? "white" : "black"
        }
    }
    const animalsHtml = document.getElementById("animals")
    board.animals.forEach(animal => {
        const animalImage = document.createElement("img")
        animalImage.src = `img/${nationalName(animal.name)}.svg`
        animalImage.onclick = () => {
            if (animal === board.focussedAnimal) {
                board.focussedAnimal = null
            } else if (animal.name !== board.currentTurn) {
                const prettyName = nationalName(board.currentTurn, true)
                notify("warn", `${prettyName} should make the next move`)
            } else {
                board.focussedAnimal = animal
            }
            updateBoard()
        }
        const animalElement = document.createElement("span")
        if (animal === board.focussedAnimal) {
            animalElement.className = "focussed animal"
        } else {
            animalElement.className = "animal"
        }
        animalElement.style = `top: ${animal.y * 4}em;left: ${animal.x * 4}em;`
        animalElement.appendChild(animalImage)
        animalsHtml.appendChild(animalElement)
    })
}


"use strict"
/* global board generateNewBoard updateBoard mainAILoop nextAIMove */

// Stores if the international or "dutch" tiles should be used
// Fox and Hounds is the default, but Wolf and Sheep is also possible
// Names on the screen and in the messages will be updated as well
let useInternationalTiles = true

function startup() {
    // This function is called when the page is first loaded
    // It generates a fresh board, and binds the listeners to the buttons
    generateNewBoard()
    setupListeners()
    // Lastly the AI main loop is called, which will keep running from there
    mainAILoop()
}

function setupListeners() {
    document.getElementById("controls-reset-scores").onclick = () => {
        document.getElementById("win-fox").innerText = "0"
        document.getElementById("win-hound").innerText = "0"
        document.getElementById("win-ratio").innerText = ""
        generateNewBoard()
    }
    document.getElementById("controls-toggle-names-icons").onclick = () => {
        useInternationalTiles = !useInternationalTiles
        const hounds = document.getElementsByClassName("hound-name")
        for (let i = 0; i < hounds.length; i++) {
            hounds[i].innerText = nationalName("hound", true)
        }
        const fox = document.getElementsByClassName("fox-name")
        for (let i = 0; i < fox.length; i++) {
            fox[i].innerText = nationalName("fox", true)
        }
        updateBoard()
    }
    document.getElementById("controls-ai-next-step").onclick = () => {
        nextAIMove()
    }
    document.getElementById("controls-rotate-board").onclick = () => {
        const boardElement = document.getElementById("board")
        if (document.getElementById("controls-rotate-board").checked) {
            if (board.currentTurn === "hound") {
                boardElement.className = "rotated"
            } else {
                boardElement.className = ""
            }
        } else {
            boardElement.className = ""
        }
    }

}

/* eslint-disable-next-line no-unused-vars */
function notify(level, message, duration=3000) {
    // Shows a notification in green (info), warn (orange) or error (red).
    // Notifications are only shown if they are not disabled on the page
    const onlyWarnings = document.getElementById("notify-level-warn").checked
    const onlyErrors = document.getElementById("notify-level-error").checked
    if (onlyWarnings && level === "info") {
        return
    } else if (onlyErrors && level !== "error") {
        return
    }
    const body = `<div class="notification notify-${level}">${message}</div>`
    const notifications = document.getElementById("notifications")
    notifications.innerHTML += body
    setTimeout(() => {
        notifications.removeChild(notifications.childNodes[0])
    }, duration)
}

function title(string) {
    return string[0].toUpperCase()  + string.slice(1)
}

function nationalName(name, pretty=false) {
    if (pretty) {
        if (useInternationalTiles) {
            let prettyName = title(name)
            if (prettyName === "Hound") {
                prettyName += "s"
            }
            return prettyName
        } else if (name === "fox") {
            return "Wolf"
        } else if (name === "hound") {
            return "Sheep"
        }
    } else if (useInternationalTiles) {
        return name
    } else {
        let dutchName = ""
        if (name === "fox") {
            dutchName = "wolf"
        } else if (name === "hound") {
            dutchName = "sheep"
        }
        return dutchName
    }
}

window.onload = startup

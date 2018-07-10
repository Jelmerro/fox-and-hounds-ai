Fox and Hounds AI project
=========================

[Github](https://github.com/Jelmerro/fox-and-hounds-ai) [Live version](https://jelmerro.github.io/fox-and-hounds-ai/index.html)

This is a school project to recreate the Fox and Hounds board game.
It's known in dutch as "Wolf en Schapen", which is why the tiles and names can be switched.
An important part of this project is the AI for both sides, using Minimax.
The algorithm itself is implemented and working,
but the evaluation function is decent at best.

## Features

### Main

- Play a game of Hounds and Fox with two players
- Compete against an AI bot player for either side
- Run simulations with two AI bot players (with options for a couple of algorithms)
- Minimax algorithm with variable depth (1-6 turns)
- Uses modern code, for modern browsers (Firefox or Chromium)
- Responsive and clean design

### Minimax variations

#### Pure

There are three AI algorithms implemented, one that's actually pure Minimax, and two variations which are biased and average.
The pure version is an unchanged implementation of the Minimax algorithm.
It calculates the worst possible outcome for each move, with a certain depth, calculated with the evaluation function.
From there it picks the best option from the worst outcomes, as an attempt to minimize the risk.
As this is a zero-sum game, minimizing the potential loss can be seen as the same as maximizing the chance to win (at least that's the theory).
The pure implementation works exactly as described above, but evaluation function scoring is far from perfect.

##### Issues

One of the most prominent problem can be seen on the fox, which will not move away from the bottom of the board,
when the depth is at least 3, meaning it will move the fox piece at least twice.
This is because for a fox on the 7th row, the worst possible outcome for moving up, is the same as the worst possible outcome of moving down: It will still be on the 7th row.
It will then pick the first possible move it finds, because no other move will be better,
which happens to be the move for going back down.
I could have "solved" this problem by changing the order of the movements,
but I think it demonstrates one of the flaws of pure Minimax perfectly.
This is not a problem when using one of the two variations I have added.

#### Biased

This works exactly the same as the pure version, with one small exception.
When two moves have exactly the same worst possible outcome score, it will pick the move with the highest average score.
In the case of the fox, it eliminates the most prominent issue of the pure version.
For the hounds, this version doesn't actually change the behavior a lot.

#### Average

This variation calculates the average outcome score for all scenarios per possible move.
Strictly speaking it's not a Minimax variation, because it doesn't calculate the worst possible outcome,
but it does in a way still minimize the potential loss.
Both the fox and the hounds act surprisingly similar when using this variation.

## Structure

The styling is split into multiple files in the css folder. The tile icons are stored in the img folder. The js folder contains all the application code. The code is split into three files:

### ai.js

Contains all the AI code, like Minimax recursion, evaluations and other algorithm related code.

### board.js

In this file the board, fox and hound classes are stored, with operations for movement, victory checks and code to display the board on the page.

### main.js

This file is the starting point for the application. It gives instruction to generate a board, starts the AI loop and contains global function for the notifications and naming.

## License

[Jelmer van Arnhem](https://github.com/Jelmerro) holds the copyright for all js, css and html files,
but they can be used under the terms of the MIT license, see the LICENSE for details.

The svg files are originally made by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect),
and are licensed as [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/).

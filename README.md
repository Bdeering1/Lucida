![lucida-wide](https://user-images.githubusercontent.com/55864293/224823456-b7999225-9a99-4934-9f29-7cf8e53f1234.gif)

*NodeJS chess engine developed using typescript*

## Features
<!-- The core aspects of any chess engine are the move search, evaluation, and board representation. -->

### Board
Lucida uses an [10x12 board](https://www.chessprogramming.org/10x12_Board) supplemented by [piece-lists](https://www.chessprogramming.org/Piece-Lists) to keep track of pieces. The center 64 squares represent the actual board, and the additional padding is used to simplify move generation. The board representation must also keeps track of move count, side to move, castle permissions, the [en passent](https://www.chess.com/terms/en-passant) square, and the [fifty move](https://en.wikipedia.org/wiki/Fifty-move_rule) counter.

<p align="center">
<img width="322" alt="Screen Shot 2022-12-21 at 12 25 57 AM" src="https://user-images.githubusercontent.com/55864293/208828245-ac40be15-b7ec-4e7d-9794-1242b9236a10.png">
</p>

### Search
Lucida performs a depth-first search using [negamax](https://www.chessprogramming.org/Negamax) with [alpha beta pruning](https://www.chessprogramming.org/Alpha-Beta), which is extended by a [quiescence search](https://www.chessprogramming.org/Quiescence_Search) (with [delta](https://www.chessprogramming.org/Delta_Pruning) and [SEE](https://www.chessprogramming.org/Static_Exchange_Evaluation) pruning) to improve search accuracy. Effective move ordering improves the efficacy of pruning since better lines will be searched first. Moves are also ordered using promotion, capture, and piece-square table scores (see below).

The search is first performed at a low depth and then repeated with increasing depth until a maximum time or depth is reached (see [iterative deepening](https://www.chessprogramming.org/Iterative_Deepening)). This strategy is effective because each search adds to the [transposition table](https://www.chessprogramming.org/Transposition_Table) (which allows previously evaluated scores to be re-used), and improves move ordering for future searches by keeping track of [PV nodes](https://www.chessprogramming.org/Node_Types#PV-Nodes).

### Evaluation
Lucida's evaluation consists of the material score, [mobility score](https://www.chessprogramming.org/Mobility), and [piece-square tables](https://www.chessprogramming.org/Piece-Square_Tables) for both the opening and endgame. The scores from these two tables are interpolated between to get the score for a given position (see [tapered eval](https://www.chessprogramming.org/Tapered_Eval)). There are also piece specific components to the evaluation - ie. rooks prefer open files, kings prefers having a pawn shield.

### Strength
The current iteration of Lucida beats Komodo 17 (2100 rating) given ~5-10 seconds per move (on 2.8 GHz Quad-Core Intel Core i7).

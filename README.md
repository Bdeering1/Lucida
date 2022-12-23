## Lucida  
NodeJS chess engine, currently under development.

### Features
<!-- The core aspects of any chess engine are the move search, evaluation, and board representation. -->

#### Board
Lucida uses an [10x12 board](https://www.chessprogramming.org/10x12_Board) supplemented by [piece-lists](https://www.chessprogramming.org/Piece-Lists) to keep track of pieces. The center 64 squares represent the actual board, and the additional padding is used to simplify move generation. The board representation must also keeps track of move count, side to move, castle permissions, the [en passent](https://www.chess.com/terms/en-passant) square, and the [fifty move](https://en.wikipedia.org/wiki/Fifty-move_rule) counter.

<img width="322" alt="Screen Shot 2022-12-21 at 12 25 57 AM" src="https://user-images.githubusercontent.com/55864293/208828245-ac40be15-b7ec-4e7d-9794-1242b9236a10.png">

#### Search
Lucida currently performs a depth-first search using [negamax](https://www.chessprogramming.org/Negamax) with [alpha beta pruning](https://www.chessprogramming.org/Alpha-Beta). Moves are ordered using promotion, capture, and piece-square table scores (see below) to improve the efficacy of pruning. The search is also made a little faster by using a [transposition table](https://www.chessprogramming.org/Transposition_Table) to re-use scores from key positions, and extended by a [quiescence search](https://www.chessprogramming.org/Quiescence_Search) for more accurate results.

#### Evaluation
Lucida's evaluation consists of the material score, [mobility score](https://www.chessprogramming.org/Mobility), and [piece-square tables](https://www.chessprogramming.org/Piece-Square_Tables) for both the opening and endgame. The scores from these two tables are interpolated between to get the score for a given position (see [tapered eval](https://www.chessprogramming.org/Tapered_Eval)).

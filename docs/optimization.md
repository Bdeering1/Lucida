# Optimization Strategies for MinMax Algorithm
(Not including alpha beta pruning)

## [Move ordering](https://www.chessprogramming.org/Move_Ordering)
Order the possible moves in such a way that better moves get checked first, increasing the chance of an early beta cutoff. 

Common ways of ordering moves
- Moves that capture
- Using less valuble pieces to capture
- [Piece-Square Tables](https://www.chessprogramming.org/Piece-Square_Tables)

    This basically is just an arbitrary 2d map for the engine to have some foreknowledge on what are good positions. 
    In each map, every square is assigned a value from -50 to 50, indicating how good or bad (in general) it is for that piece to be in some particular position
    Typically uses a series of maps for each piece - early, middle, and end game maps.

    Some tables I found:
    - [Simplified Evaluation Function](https://www.chessprogramming.org/Simplified_Evaluation_Function)
    - [PeSTO's Evaluation Function](https://www.chessprogramming.org/PeSTO%27s_Evaluation_Function)

## [Negamax](https://en.wikipedia.org/wiki/Negamax#:~:text=Negamax%20search%20is%20a%20variant,the%20value%20to%20player%20B.)
Not really to optimize minmax, but is an alternative to using minmax, and simplifies the implementation a bit

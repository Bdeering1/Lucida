import Board from "../board/board";
import MoveGenerator from "../game/move-generator";
import Search from "../intelligence/search";

export default async function runUci() {
    const board = new Board();
    const moveGenerator = new MoveGenerator(board);
    const search = new Search(board, moveGenerator);
    
    throw new Error("UCI not implemented yet.");

    // get console input here
}
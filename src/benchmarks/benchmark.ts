/* eslint-disable no-magic-numbers */
import Board from "../board/board";
import { IBoard } from "../board/iboard";
import MoveGenerator from "../game/move-generator";
import { MS_PER_SECOND, START_FEN } from "../shared/constants";
import Search from "../intelligence/search";
import { parseFen } from "../board/board-setup";
import { pauseForInput } from "../cli/input";

const DEPTH_LIMIT = 5;
const LAST_DEPTH_CUTOFF = 5 * MS_PER_SECOND;
const ITER_PER_POS = 3;

const TEST_POSITIONS = [
    START_FEN,
    'r2qk2r/ppp2p1p/2n5/3pP1p1/3P1p2/B1PB1RnP/P1P3P1/1R1Q2K1 b kq - 3 13',
    '2kr1b1r/ppp2ppp/8/4nb2/3nP3/1B3PB1/PP4PP/RN3KNR b - - 2 13',
    'r2q1rk1/pp3ppp/2p2n2/2b1p3/3nP1b1/2NBB3/PPPQNPPP/2KR3R b - - 7 10'
];

export default async function runBenchmarks(): Promise<void> {
    const board = new Board();
    const moveGenerator = new MoveGenerator(board);
    const search = new Search(board, moveGenerator);

    let totalTime = 0;
    let avgTime = 0;
    const positionTimes = [];
    for (const fen of TEST_POSITIONS) {
        console.log(`\nTESTING --- ${fen}\n`);
        let bestTime = Infinity;
        for (let i = 0; i < ITER_PER_POS; i++) {
            moveGenerator.reset();
            const time = testPosition(board, search, fen);
            totalTime += time;
            if (time < bestTime) bestTime = time;
        }
        positionTimes.push(bestTime);
        // for (const [key,value] of Object.entries(process.memoryUsage())){
        //     console.log(`Memory usage by ${key}, ${value / 1000000}MB`);
        // }
    }
    avgTime = totalTime / (TEST_POSITIONS.length * ITER_PER_POS);

    console.log('\n\n\n');
    for (let i = 0; i < positionTimes.length; i++) {
        console.log(`Test --- ${TEST_POSITIONS[i]}`);
        console.log(`Best: ${Math.round(positionTimes[i])}ms`);
    }
    console.log('\nAggregate results');
    console.log(`Average time: ${Math.round(avgTime)}ms`);
    console.log(`Total time: ${totalTime}ms\n`);

    await pauseForInput();
}

function testPosition(board: IBoard, search: Search, fen: string): number {
    parseFen(board, fen);

    const startTime = Date.now();
    search.getBestMove(false, LAST_DEPTH_CUTOFF, DEPTH_LIMIT);
    const endTime = Date.now();
    return endTime - startTime;
}
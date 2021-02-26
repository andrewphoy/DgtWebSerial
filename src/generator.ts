import { LegalMove } from './types/move';
import * as Utils from './utils';
import * as Chessops from 'chessops';
import { chessgroundDests } from 'chessops/compat';

export function legalMoves(position: Chessops.Position): LegalMove[] {
    let possibles: LegalMove[] = [];

    let valids =  chessgroundDests(position);
    valids.forEach((dests: Chessops.SquareName[], from: Chessops.SquareName) => {
        let ixFrom = Chessops.parseSquare(from);
        let piece: Chessops.Piece = position.board.get(ixFrom)!;

        for (let i = 0; i < dests.length; i++) {
            let to = dests[i];
            let ixDest = Chessops.parseSquare(to);

            // this is solely for generating valid pgn from the moves
            // it's entirely possible that there's a better way to do this
            let destObject: Chessops.Piece | undefined = position.board.get(ixDest);
            let isCapture: boolean = false;
            if (destObject && destObject.color != piece.color) {
                isCapture = true;
            }
            
            let clone = position.clone();

            // special case promotions
            


            // default
            let move = { from: ixFrom, to: ixDest };
            clone.play(move);

            let legal: LegalMove = <LegalMove>{
                move: move,
                from: from,
                to: to,
                result: clone,
                piece: piece.role,
                isCapture: isCapture,
                isCheck: clone.isCheck()
            };

            legal.san = generateMoveSan(legal);
            possibles.push(legal);
        }
    });

    // check san for ambiguous moves
    // a more elegant solution would try to disambiguate with only file or rank...
    // also, it would be even better if we did not have to rely on legality
    for (let i = 0; i < possibles.length; i++) {
        let san = possibles[i].san;
        for (let j = (i + 1); j < possibles.length; j++) {
            let other = possibles[j].san;
            if (san == other) {
                possibles[i].san = generateMoveSan(possibles[i], true);
                possibles[j].san = generateMoveSan(possibles[j], true);
            }
        }
    }

    return possibles;
}

function generateMoveSan(move: LegalMove, fullSan: boolean = false) {
    if (move.piece == "pawn") {
        return (move.isCapture ? move.from[0] + 'x' : '') + move.to;
    }
    if (fullSan) {
        return Utils.sanPiece(move.piece) + move.from + (move.isCapture ? 'x' : '') + move.to;
    } else {
        return Utils.sanPiece(move.piece) + (move.isCapture ? 'x' : '') + move.to;
    }
}
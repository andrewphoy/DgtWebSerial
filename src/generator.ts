import { LegalMove } from './types/move';
import * as Utils from './utils';
import * as Chessops from 'chessops';
import { chessgroundDests } from 'chessops/compat';
import { makeSan } from 'chessops/san';

const promotionPieces: PieceType[] = new Array("rook", "knight", "bishop", "queen");

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
            if (piece.role == "pawn") {
                if ((piece.color == "white" && to[1] == "8") || piece.color == "black" && to[1] == "1") {
                    // promotion
                    promotionPieces.forEach((promo) => {
                        let move = { from: ixFrom, to: ixDest, promotion: promo };
                        clone.play(move);

                        possibles.push(<LegalMove>{
                            move: move,
                            from: from,
                            to: to,
                            result: clone,
                            san: makeSan(position, move)
                        });
                    });
                    continue;
                }
            }


            // default
            let move = { from: ixFrom, to: ixDest };
            clone.play(move);

            possibles.push(<LegalMove>{
                move: move,
                from: from,
                to: to,
                result: clone,
                san: makeSan(position, move)
            });
        }
    });

    console.log(possibles);
    return possibles;
}
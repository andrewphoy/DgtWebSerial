import { Chess, Move, SquareName } from "chessops";

export interface LegalMove {
    move: Move;
    from: SquareName;
    to: SquareName;
    promotion?: PieceType;
    result: Chess;
    legalMoves?: LegalMove[];
    san: string;
    clockTime?: string;
}
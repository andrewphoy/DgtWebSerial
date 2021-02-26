import { Chess, Move, SquareName } from "chessops";

export interface LegalMove {
    move: Move;
    from: SquareName;
    to: SquareName;
    promotion?: PieceType;
    result: Chess;
    legalMoves?: LegalMove[];
    piece: PieceType;
    san: string;
    clockTime?: string;
    isCapture: boolean;
    isCheck: boolean;
}
import * as Utils from './../utils';

const normalStart = [6, 2, 5, 7, 3, 5, 2, 6, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -6, -2, -5, -7, -3, -5, -2, -6];
const flippedStart = [-6, -2, -5, -3, -7, -5, -2, -6, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 6, 2, 5, 3, 7, 5, 2, 6];

export default class Board {

    squares: number[];

    constructor() {
        this.squares = new Array(64);
    }

    public equals(other: Board) {
        for (let ix = 0; ix < 64; ix++) {
            if (this.squares[ix] != other.squares[ix]) {
                return false;
            }
        }
        return true;
    }

    public reverse(): Board {
        let result = new Board();
        for (let ix = 0; ix < 64; ix++) {
            result.squares[63 - ix] = this.squares[ix];
        }
        return result;
    }
    
    public updateField(squareId: number, pieceCode: number) {
        let ixSquare: number = Utils.squareForDgtIndex(squareId);
        let piece: SPiece = Utils.getPieceForDgtEncoding(pieceCode);

        let nextPos = new Board();
        nextPos.squares = Object.assign([], this.squares);
        nextPos.squares[ixSquare] = piece;

        return nextPos;
    }

    public isStartPosition(): boolean {
        for (let ix = 0; ix < 64; ix++) {
            if (this.squares[ix] != normalStart[ix]) {
                return false;
            }
        }
        return true;
    }

    public isFlippedStartPosition(): boolean {
        for (let ix = 0; ix < 64; ix++) {
            if (this.squares[ix] != flippedStart[ix]) {
                return false;
            }
        }
        return true;
    }

    public static createFromPayload(payload: Uint8Array): Board {
        if (payload.length != 64) {
            // boards should really have 64 squares
            throw 'Error creating position from payload';
        }

        let board = new Board();
        for (let row = 7; row >= 0; row--) {
            for (let col = 0; col < 8; col++) {
                let dgtIx = (7 - row) * 8 + col;
                let ix = row * 8 + col;
                board.squares[ix] = Utils.getPieceForDgtEncoding(payload[dgtIx]);
            }
        }
        return board;
    }


}
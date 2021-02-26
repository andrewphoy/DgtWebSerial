export function getPieceForDgtEncoding(piece: number): SPiece {
    switch (piece) {
        case 0x00:
            return SPiece.Empty;
        case 0x01:
            return SPiece.WhitePawn;
        case 0x02:
            return SPiece.WhiteRook;
        case 0x03:
            return SPiece.WhiteKnight;
        case 0x04:
            return SPiece.WhiteBishop;
        case 0x05:
            return SPiece.WhiteKing;
        case 0x06:
            return SPiece.WhiteQueen;
        case 0x07:
            return SPiece.BlackPawn;
        case 0x08:
            return SPiece.BlackRook;
        case 0x09:
            return SPiece.BlackKnight;
        case 0x0a:
            return SPiece.BlackBishop;
        case 0x0b:
            return SPiece.BlackKing;
        case 0x0c:
            return SPiece.BlackQueen;
        default:
            return SPiece.Empty;
    }
}

/**
 * Gets the 0-63 mailbox index from the dgt index sent as part of a field update message
 * @param ix the field update index
 */
export function squareForDgtIndex(ix: number): number {
    let row = ~~(ix / 8);
    let col = ix % 8;
    return (7 - row) * 8 + col;
}

export function pieceForCode(p: number): string {
    switch (p) {
        case 1:
            return 'P';
        case 2:
            return 'N';
        case 5:
            return 'B';
        case 6:
            return 'R';
        case 7:
            return 'Q';
        case 3:
            return 'K';
        case -1:
            return 'p';
        case -2:
            return 'n';
        case -5:
            return 'b';
        case -6:
            return 'r';
        case -7:
            return 'q';
        case -3:
            return 'k';
        case 0:
        default:
            return '\0';
    }
}

export function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function withTimeout(promise: Promise<any>, timeout: number): Promise<any> {
    return Promise.race([promise, new Promise((_resolve, reject) => setTimeout(reject, timeout))]);
}

export function bcdDecode(b: number): number {
    let first = (b & 15);
    let second = ((b >> 4) & 15);
    return second * 10 + first;
}

export function clockToDisplay(ci: PlayerClockInfo): string {
    return ('0' + ci.hours).slice(-2) + ':' + ('0' + ci.minutes).slice(-2) + ':' + ('0' + ci.seconds).slice(-2);
}

export function sanPiece(role: PieceType) {
    switch (role) {
        case 'pawn':
            return '';
        case 'knight':
            return 'N';
        case 'bishop':
            return 'B';
        case 'rook':
            return 'R';
        case 'queen':
            return 'Q';
        case 'king':
            return 'K';
        default:
            throw 'unknown piece type';
    }
}
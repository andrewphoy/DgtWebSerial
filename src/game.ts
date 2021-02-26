import Clock from "./clock";
import Board from './models/board';
import * as Generator from './generator';
import * as Utils from './utils';
import { ClockTimeMessage } from './messages/clockTimeMessage';
import * as Chessops from 'chessops';
import { LegalMove } from "./types/move";

export default class {

    /**
     * Board orientation
     * By default, black is on the top (bottom of board is the side closest to the connector)
     */
    public blackOnTop: boolean;
    public startDate: Date;

    private moveCallback: (move: LegalMove) => void;

    private _validPosition?: Board;
    private _rawPosition?: Board;
    public currentPosition: Chessops.Position;

    private _validMoves?: LegalMove[];

    private _moves: LegalMove[];
    private _currentPly: number;

    private _uncommittedMove?: LegalMove;
    private _uncommittedPosition?: Board;

    private _commitTimeout: number = 0;

    private _clock: Clock;
    
    constructor(position: Chessops.Position, blackOnTop: boolean, cbMove: (m: LegalMove) => void) {
        this.startDate = new Date();
        this.blackOnTop = blackOnTop;

        this.currentPosition = position;

        this._moves = [];
        this._currentPly = 0;

        this._clock = new Clock(this.blackOnTop);

        this.moveCallback = cbMove;
    }

    public get moves() {
        return this._moves;
    }

    public get currentPly() {
        return this._currentPly;
    }

    public addPosition(pos: Board) {
        if (this._rawPosition && pos.equals(this._rawPosition)) {
            return;
        } else {
            this._rawPosition = pos;
        }

        // check for start pos?
        if (!this.blackOnTop) {
            pos = pos.reverse();
        }

        // always clear the timeout
        if (this._commitTimeout > 0) {
            clearTimeout(this._commitTimeout);
            this._commitTimeout = 0;
        }

        // if we have "undone" a move, make sure it's not listed as uncommitted
        if (this._validPosition && pos.equals(this._validPosition)) {
            // if there's an uncommitted move, remove it
            this.clearUncommittedMove();
        } else {
            this.attemptInsertMove(pos);
        }
    }

    public updateClock(msg: ClockTimeMessage) {
        if (!msg.metaInfo.clockConnected) {
            return;
        }

        // if we have a pending move, and the clock has just been pressed, commit it
        let commitMove: boolean = false;
        if (this._uncommittedMove) {
            // the uncommitted move is for the opposite color
            if (this._clock.isClockPress(msg, this._uncommittedMove.result.turn == "white")) {
                commitMove = true;
            }
        }

        this._clock.updateFromMessage(msg);

        if (this._uncommittedMove && commitMove) {
            this.commitLastMove();
        }
    }

    private attemptInsertMove(pos: Board): boolean {
        // game is already started and we have a new position
        // we have a few possibilities
        //  1) it's a new move
        //  2) it's an indeterminate state and a valid part of a move
        //  3) it's an indeterminate state and not part of a move
        //  4) it's the result of two moves
        //  5) it's a "continuation" of the last move (i.e. Qe2-e4 and the last move is committed as Qe2-e3)
        //     * this last situation isn't handled yet - it can only happen if we wait a really long time (tm) before finishing

        // if we haven't started a game, we can't do anything
        if (!this.currentPosition) {
            return false;
        }

        // start by seeing if we can make a move from the last known-good position

        // generate all legal moves if necessary
        if (this._validMoves == undefined) {
            this._validMoves = Generator.legalMoves(this.currentPosition);
        }

        let move: LegalMove | undefined = undefined;
        for (let i = 0; i < this._validMoves!.length; i++) {
            if (this.checkValidMove(pos, this._validMoves![i])) {
                this.setUncommittedMove(this._validMoves![i], pos);
                return true;
            }
        }

        if (this._uncommittedMove) {
            // if we have a pending move, see if we're following on from that
            if (!this._uncommittedMove.legalMoves) {
                this._uncommittedMove.legalMoves = Generator.legalMoves(this._uncommittedMove.result);
            }

            for (let i = 0; i < this._uncommittedMove.legalMoves.length; i++) {
                let m: LegalMove = this._uncommittedMove.legalMoves[i];
                if (this.checkValidMove(pos, m)) {
                    this.commitLastMove();
                    this.setUncommittedMove(m, pos);
                    return true;
                }
            }
        } else {
            
            // it is possible for two valid moves to be entered simultaneously
            // this is most likely because both players moved at the same time and the second
            // move by ply started before the first one completed
            // one detail we can use is that there is no valid way (in standard chess)
            // to get to a given legal board state where both sides have moved unless both sides have 
            // made a legal move
            // i.e. there is no single move for white that will have all of the position changes
            // of a move pair for white and black

            for (let i = 0; i < this._validMoves!.length; i++) {
                let firstMove = this._validMoves[i];
                if (!firstMove.legalMoves) {
                    firstMove.legalMoves = Generator.legalMoves(firstMove.result);
                }
                for (let j = 0; j < firstMove.legalMoves.length; j++) {
                    let secondMove = firstMove.legalMoves[j];
                    if (this.checkValidMove(pos, secondMove)) {
                        this.setAndCommitMove(firstMove);
                        this.setUncommittedMove(secondMove, pos);
                    }
                }
            }
        }

        return false;
    }
    
    private checkValidMove(pos: Board, move: LegalMove): boolean {
        for (let ix = 0; ix < 64; ix++) {
            let piece = pos.squares[ix];
            let desired = move.result.board.get(ix);
            if (desired == undefined) {
                if (piece == 0) {
                    continue;
                } else {
                    return false;
                }
            }
            
            if (desired.color == 'white' && piece < 0) {
                return false;
            } else if (desired.color == 'black' && piece > 0) {
                return false;
            }

            if (desired.role != this.getRoleForPiece(piece)) {
                return false;
            }
        }

        return true;
    }

    private getRoleForPiece(piece: number) {
        let abs = Math.abs(piece);
        switch (abs) {
            case 1:
                return 'pawn';
            case 2:
                return 'knight';
            case 3:
                return 'king';
            case 5:
                return 'bishop';
            case 6:
                return 'rook';
            case 7:
                return 'queen';
            default:
                return 'unknown'; 
        }
    }

    private setUncommittedMove(move: LegalMove, pos: Board) {
        if (this._commitTimeout > 0) {
            clearTimeout(this._commitTimeout);
        }

        //console.log('setting tentative move', move.from + move.to);

        this._uncommittedMove = move;
        this._uncommittedPosition = pos;

        this._commitTimeout = setTimeout(() => {
            this.commitLastMove();
        }, this.getMoveTimeout());
    }

    private getMoveTimeout(): number {
        // considerations...
        // extra time for castling?
        // based on remaining clock time?
        return 1000;
    }

    private clearUncommittedMove() {
        this._uncommittedMove = undefined;
        this._uncommittedPosition = undefined;
    }

    private commitLastMove() {
        if (!this._uncommittedMove) {
            return;
        }

        if (this._commitTimeout > 0) {
            clearTimeout(this._commitTimeout);
        }

        this.currentPosition = this._uncommittedMove.result;
        this._validPosition = this._uncommittedPosition;

        // let move: Move = this._uncommittedMove!;
        if (this._clock?.metaInfo?.clockConnected) {
            let ci = (this.currentPosition.turn == "black" ? this._clock.whiteClockInfo : this._clock.blackClockInfo);
            this._uncommittedMove.clockTime = Utils.clockToDisplay(ci);
        }

        this._moves.push(this._uncommittedMove);
        this._currentPly++;
        
        this.moveCallback(this._uncommittedMove);

        this._validMoves = undefined;
        if (this._uncommittedMove?.legalMoves) {
            this._validMoves = this._uncommittedMove.legalMoves;
        }
        this.clearUncommittedMove();
    }

    private setAndCommitMove(move: LegalMove) {
        this.currentPosition = move.result;
        this._validPosition = undefined;

        // let move: Move = this._uncommittedMove!;
        if (this._clock?.metaInfo?.clockConnected) {
            let ci = (this.currentPosition.turn == "black" ? this._clock.whiteClockInfo : this._clock.blackClockInfo);
            move.clockTime = Utils.clockToDisplay(ci);
        }

        this._moves.push(move);
        this._currentPly++;
        
        this.moveCallback(move);

        this._validMoves = undefined;
        this.clearUncommittedMove();
    }

    /**
     * Build the complete pgn for the game
     * Eventually move this out of the game object
     */
    public get pgn(): string {
        let d = this.startDate;
        let year = d.getUTCFullYear();
        let month = d.getUTCMonth() + 1;
        let day = d.getUTCDate();

        let utcDate = year.toString() + '.' + ('0' + month).slice(-2) + '.' + ('0' + day).slice(-2);
        let utcTime = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2)

        let str: string = '';
        str += '[Event "DGT Board Game"]\n';
        str += '[Site "My DGT board"]\n';
        str += '[Date "' + utcDate + '"]\n';
        str += '[UTCDate "' + utcDate + '"]\n';
        str += '[UTCTime "' + utcTime + '"]\n';
        str += '[White "White"]\n';
        str += '[Black "Black"]\n';
        str += '[Termination "Unterminated"]\n';
        str += '[Result "*"]\n';

        if (this._clock?.metaInfo?.clockConnected && this._clock?.metaInfo?.clockRunning) {
            let clockDisplay: string;
            if (this._clock.whiteClockInfo.isRunning) {
                clockDisplay = 'W/' + Utils.clockToDisplay(this._clock.whiteClockInfo);
            } else {
                clockDisplay = 'B/' + Utils.clockToDisplay(this._clock.blackClockInfo);
            }
            str += '[Clock "' + clockDisplay + '"]\n';
        }

        str += '\n';

        for (let i = 0; i < this.moves.length; i++) {
            let m = this.moves[i];
            if (i % 2 == 0) {
                str += (i + 1).toString() + '. ';
            }

            str += m.san + ' ';

            if (m.clockTime) {
                str += '{[%clk ' + m.clockTime + ']} ';
            }
        }

        //TODO check if game is over
        str += '*';

        return str;
    }

}
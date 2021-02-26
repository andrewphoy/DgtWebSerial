import { DgtMessageBase } from "./dgtMessage";
import Board from "../models/board";

export class BoardDumpMessage extends DgtMessageBase {

    private _board!: Board;

    public get board() {
        return this._board;
    }

    public processPayloadBuffer(payload: Uint8Array): void {
        let board = Board.createFromPayload(payload);
        this._board = board;
        //console.log('Board dump message: ', position.fen);
    }

}
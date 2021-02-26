//import Position from "./chess/position";
import Board from './models/board';
import Game from "./game";
import { BoardDumpMessage } from "./messages/boardDumpMessage";
import { FieldUpdateMessage } from "./messages/fieldUpdateMessage";
import { SerialNumberMessage } from "./messages/serialNumberMessage";
import SerialController from "./serial";
import * as Utils from "./utils";
import { ClockTimeMessage } from "./messages/clockTimeMessage";
import { Chess, defaultSetup } from 'chessops';
import { parseFen } from 'chessops/fen';
import { LegalMove } from './types/move';

export default class {

    private serial: SerialController;
    private _position?: Board;
    private _game?: Game;

    /**
     * the serial number of the connected board
     */
    private _serialNumber?: number;

    private chessOpsStart = Chess.fromSetup(defaultSetup()).unwrap();

    constructor() {
        this.serial = new SerialController();
        this.serial.onMessage = this.messageReceived.bind(this);
    }

    public onMove?: (move: LegalMove) => void;
    public onConnect?: () => void;

    public async init(): Promise<void> {
        // try to create a serial port connection

        let success = await this.serial.open();
        if (this.serial.connected) {

            //TODO check local storage to see if we should be picking up where we left off...

            this.serial.sendCommand(DgtCommands.SendSerialNumber);
            await Utils.delay(1000);
            this.serial.sendCommand(DgtCommands.SendBoard);
            await Utils.delay(1000);
            this.serial.sendCommand(DgtCommands.SendClockTime);
            await Utils.delay(1000);
            this.serial.sendCommand(DgtCommands.SendUpdateNice);

            //await Utils.delay(1000);
            //this.serial.sendClockText('ANDREW');

            //await Utils.delay(5000);
            //this.serial.sendClockSetAndRun();
        }

    }

    public get serialNumber(): number | undefined {
        return this._serialNumber;
    }

    private onmove(move: LegalMove) {
        if (this.onMove) {
            this.onMove(move);
        }
    }

    private messageReceived(msg: DgtMessage): void {
        if (msg.id == DgtConstants.BoardDump) {
            let position: Board = (msg as BoardDumpMessage).board;
            if (this._position == null || !this._position.equals(position)) {
                this.updatePosition(position);
            }
        }

        if (msg.id == DgtConstants.FieldUpdate) {
            this.handleFieldUpdate(msg as FieldUpdateMessage);
        }

        if (msg.id == DgtConstants.SerialNumber) {
            this._serialNumber = (msg as SerialNumberMessage).serialNumber;
            if (this.onConnect) {
                this.onConnect();
            }
        }

        if (msg.id == DgtConstants.ClockTime) {
            this.handleClockUpdate(msg as ClockTimeMessage);
        }
    }

    private updatePosition(position: Board): void {
        if (position.isStartPosition()) {
            if (this._game) {
                // finish off the old game
            }
            this._game = new Game(this.chessOpsStart, true, this.onmove.bind(this));
        } else if (position.isFlippedStartPosition()) {
            if (this._game) {
                // finish off the old game
            }
            this._game = new Game(this.chessOpsStart, false, this.onmove.bind(this));
        //} else if (position.isEndPosition()) {
            // mark game result
        } else {
            this._game?.addPosition(position);
        }

        // always update the current position
        this._position = position;
    }

    private handleFieldUpdate(msg: FieldUpdateMessage): void {
        if (msg == null) {
            return;
        }

        if (this._position) {
            let nextPos = this._position.updateField(msg.squareId, msg.pieceCode);
            this.updatePosition(nextPos);
        }
    }

    private handleClockUpdate(msg: ClockTimeMessage): void {
        if (this._game) {
            this._game.updateClock(msg);
        }
    }

    public pgn(): string {
        if (this._game) {
            return this._game.pgn;
        } else {
            return '';
        }
    }
}
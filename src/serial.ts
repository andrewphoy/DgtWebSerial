import MessageReader from "./messageReader";
import * as Utils from "./utils";
import { SerialNumberMessage } from "./messages/serialNumberMessage";

export default class {

    private _port!: SerialPort;
    private reader: MessageReader;

    private _attemptingConnect: boolean = false;
    private _cbConnectSuccess?: (serial: number) => void;

    public onMessage?: (msg: DgtMessage) => void;

    //#region Properties
    private _portName: string = "";
    public get portName(): string {
        return this._portName;
    }

    private _connected: boolean = false;
    public get connected(): boolean {
        return this._connected;
    }

    //#endregion

    constructor() {
        this.reader = new MessageReader();
        this.reader.onMessage = this.handleSerialMessage;
    }


    private async attemptOpen(): Promise<boolean> {
        return new Promise<void>(async (resolve, reject) => {

        }).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    public async open(): Promise<boolean> {
        this._attemptingConnect = true;
        this.dispose();
        try {
            let port = await navigator.serial.requestPort();
            if (port != null) {
                await port.open({ baudRate: 9600 });

                setTimeout(() => this.readLoop(port), 1);

                this.sendCommand(DgtCommands.SendSerialNumber);

                //TODO verify that it's a dgt board by getting the serial number

                this._port = port;
                this._connected = true;
                return true;
            }

            return false;

        } catch {
            // if the user does not select a port, requestPort throws an exception
            return false;
        } finally {
            this._attemptingConnect = false;
        }
    }

    private dispose() {
        this._connected = false;
    }

    private async readLoop(port: SerialPort) {
        while (port.readable) {
            let sr = port.readable.getReader();
            try {
                while (true) {
                    let { value, done } = await sr.read();
                    if (done) {
                        break;
                    }
                    this.reader.processStreamData(value);
                }
            } catch (err) {

            } finally {
                sr.releaseLock();
            }
        }
    }

    public async sendCommand(messageId: number) {
        if (!this._connected) {
            return;
        }
        let buffer = new Uint8Array(1);
        buffer[0] = messageId;
        let writer = this._port.writable.getWriter();
        await writer.write(buffer);
        writer.releaseLock();
    }

    public async sendClockText(display: string) {
        if (!this._connected) {
            return;
        }
        let buffer = new Uint8Array(14);
        buffer[0] = 0x2b;
        buffer[1] = 0x0c; // 12, discounts the header
        buffer[2] = 0x03; // start
        buffer[3] = 0x0c; // clock command code (0x0c = ascii)
        buffer[12] = 8; // beep because we can
        buffer[13] = 0x00; // end

        for (let i = 4; i < 12; i++) {
            let code = (display.length >= i - 3) ? display.charCodeAt(i - 4) : 32;
            buffer[i] = code;
        }

        let writer = this._port.writable.getWriter();
        await writer.write(buffer);
        writer.releaseLock();
    }

    public async sendClockSetAndRun() {
        let buffer = new Uint8Array(14);
        buffer[0] = 0x2b;
        buffer[1] = 0x0a; // 10, discounts the header
        buffer[2] = 0x03; // start
        buffer[3] = 0x0a; // clock command code (0x0a = set and run)
        buffer[4] = 1; // left hours
        buffer[5] = 29; // left minutes
        buffer[6] = 59; // left seconds
        buffer[7] = 0; // right hours
        buffer[8] = 6; // right minutes
        buffer[9] = 3; // right seconds
        buffer[10] = 3; // left running
        buffer[11] = 0x00; // end

        let writer = this._port.writable.getWriter();
        await writer.write(buffer);
        writer.releaseLock();
    }

    public async testClock() {

        let string = 'Andrew';

        let buffer = new Uint8Array(14);
        buffer[0] = 0x2b;
        buffer[1] = 0x0c; // 12, discounts the header
        buffer[2] = 0x03; // start
        buffer[3] = 0x0c; // clock command code (0x0c = ascii)
        buffer[4] = 'A'.charCodeAt(0);
        buffer[5] = 'B'.charCodeAt(0);
        buffer[6] = 'C'.charCodeAt(0);
        buffer[7] = 'D'.charCodeAt(0);
        buffer[8] = 'E'.charCodeAt(0);
        buffer[9] = 'F'.charCodeAt(0);
        buffer[10] = 'G'.charCodeAt(0);
        buffer[11] = 'H'.charCodeAt(0);
        buffer[12] = 8;
        buffer[13] = 0x00; // end

        let writer = this._port.writable.getWriter();
        await writer.write(buffer);
        writer.releaseLock();
    }

    private handleSerialMessage = (msg: DgtMessage) => {
        if (this.onMessage) {
            this.onMessage(msg);
        }
    }
}

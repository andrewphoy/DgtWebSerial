import { EmptyMessage } from "./messages/emptyMessage";
import { SerialNumberMessage } from "./messages/serialNumberMessage";
import { BoardDumpMessage } from "./messages/boardDumpMessage";
import { FieldUpdateMessage } from "./messages/fieldUpdateMessage";
import { ClockTimeMessage } from "./messages/clockTimeMessage";


export default class {

    readonly initialBufferSize = 2048;

    private buffer: Uint8Array;
    private bufferSize: number;
    //private ixPosition: number;
    private cb: number;
    private ixMessageStart: number;

    public onMessage?: (msg: DgtMessage) => void;

    constructor() {
        //this.ixPosition = 0;
        this.cb = 0;
        this.ixMessageStart = 0;
        this.buffer = new Uint8Array(this.initialBufferSize);
        this.bufferSize = this.initialBufferSize;
    }


    public processStreamData(data: Uint8Array) {
        if (this.cb + data.length > this.bufferSize) {
            // increase the size of the buffer
            throw 'out of space';
        }

        this.buffer.set(data, this.cb);
        //this.ixPosition += data.length;
        this.cb += data.length;

        let tryAgain = true;
        while (this.cb >= 3 && tryAgain) {
            let cbPrev = this.cb;
            tryAgain = false;
            this.cb = this.generateMessage();

            if (this.cb != cbPrev) {
                this.ixMessageStart = 0;
                tryAgain = true;
            }
        }

        //TODO put generated message into a queue that can then be dequeued
    }

    /**
     * Tries to create a message using the header information
     * If it does, it will slice off the payload from the start of the array
     * A future improvement is to do some mini GC instead
     */
    private generateMessage() : number {
        if (this.cb < 3 || this.buffer.length < 3) {
            // if we don't have enough for the header, wait for more data
            return this.cb;
        }

        let length = (this.buffer[this.ixMessageStart + 1] << 7) | this.buffer[this.ixMessageStart + 2];
        if (length > 0 && this.cb < length) {
            // return and fetch more data from the port
            return this.cb;
        }

        let messageId =  this.buffer[this.ixMessageStart] ^ DgtConstants.MessageBit;
        let message = this.buildMessage(messageId, length, this.buffer.slice(this.ixMessageStart + 3, this.ixMessageStart + length));

        if (this.onMessage) {
            this.onMessage(message);
        }

        // clean up the buffer and return
        if (this.cb == length) {
            // if the entire buffer was this message, zero it out (probably unnecessary)
            this.buffer.fill(0, 0);
            return 0;
        } else {
            console.log('keeping some number of bytes');
            // cb > length
            // we have additional bytes in the buffer, possibly from another message
            let newBuffer = new Uint8Array(this.initialBufferSize);

            // copy the extra bytes from the old buffer to the new buffer
            newBuffer.set(this.buffer.slice(this.ixMessageStart + length + 3, this.cb));
            this.buffer = newBuffer;
            return (this.cb - length);
        }
    }

    private buildMessage(messageId: number, length: number, payload: Uint8Array): DgtMessage {
        let msg: DgtMessage;
        switch (messageId) {
            case DgtConstants.SerialNumber:
                case DgtConstants.LongSerialNumber:
                    msg = new SerialNumberMessage(messageId, length, payload);
                    break;
                // case DgtConstants.Version:
                //     msg = new VersionMessage(messageId, length, payload);
                //     break;
                case DgtConstants.ClockTime:
                    msg = new ClockTimeMessage(messageId, length, payload);
                    break;
                case DgtConstants.BoardDump:
                    msg = new BoardDumpMessage(messageId, length, payload);
                    break;
                case DgtConstants.FieldUpdate:
                    msg = new FieldUpdateMessage(messageId, length, payload);
                    break;
                default:
                    msg = new EmptyMessage(messageId, length, payload);
                    break;
        }

        msg.processPayloadBuffer(payload);
        return msg;
    }
}
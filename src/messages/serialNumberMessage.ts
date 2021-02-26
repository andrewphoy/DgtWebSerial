import { DgtMessageBase } from "./dgtMessage";

export class SerialNumberMessage extends DgtMessageBase {

    private _serialString: string = '';
    private _serialNumber: number = 0;

    public get serialNumber(): number {
        return this._serialNumber;
    }

    public get serialString(): string {
        return this._serialString;
    }
    
    public processPayloadBuffer(payload: Uint8Array): void {
        // force id to always be SerialNumber, even if it's a LongSerialNumber
        this.id = DgtConstants.SerialNumber;

        let serial = new TextDecoder("ascii").decode(payload);
        this._serialString = serial;
        this._serialNumber = parseInt(serial, 10);
    }

}
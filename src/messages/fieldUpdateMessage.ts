import { DgtMessageBase } from "./dgtMessage";

export class FieldUpdateMessage extends DgtMessageBase {
    /*
    byte 0: DGT_MSG_FIELD_UPDATE
    byte 1: LLH_SEVEN(DGT_SIZE_FIELD_UPDATE) (=0 fixed)
    byte 2: LLL_SEVEN(DGT_SIZE_FIELD_UPDATE) (=5 fixed)
    byte 3: field number (0-63) which changed the piece code
    byte 4: piece code including EMPTY, where a non-empty field became empty
    */

    public squareId!: number;
    public pieceCode!: number;

    public processPayloadBuffer(payload: Uint8Array): void {
        if (this.length != 5) {
            console.log('wrong size');
        }

        this.squareId = payload[0];
        this.pieceCode = payload[1];
    }

}
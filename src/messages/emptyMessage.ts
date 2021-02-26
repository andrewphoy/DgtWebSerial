import { DgtMessageBase } from "./dgtMessage";

export class EmptyMessage extends DgtMessageBase {
    
    public processPayloadBuffer(_payload: Uint8Array): void { }

}
export abstract class DgtMessageBase implements DgtMessage {
    public id: number;
    /**
     * The length of the message, including the three bytes for the header
     */
    public length: number;
    public type: DgtMessageType;

    constructor(id: number, length: number, payload: Uint8Array) {
        this.id = id;
        this.length = length;
        this.type = this.getType(id);
    }

    public abstract processPayloadBuffer(payload: Uint8Array): void;

    private getType(id: number): DgtMessageType {
        switch (id) {
            case DgtConstants.BoardDump:
                return 'boardDump';
            case DgtConstants.SerialNumber:
            case DgtConstants.LongSerialNumber:
                return 'serialNumber'
            case DgtConstants.Version:
                return 'version';
            case DgtConstants.ClockTime:
                return 'clockTime';
            case DgtConstants.FieldUpdate:
                return 'fieldUpdate';
            case DgtConstants.EeMoves:
                return 'eeMoves';
            default: 
                return 'none';
        }
    }
}
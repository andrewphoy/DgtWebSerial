interface DgtMessage {
    id: number;
    length: number;
    type: DgtMessageType;
    processPayloadBuffer(payload: Uint8Array): void;
}

type DgtMessageType = 
    'none' 
    | 'boardDump' 
    | 'clockTime' 
    | 'fieldUpdate' 
    | 'eeMoves'
    | 'busAddress'
    | 'serialNumber'
    | 'trademark'
    | 'version'
    | 'boardDump50B'
    | 'boardDump50W'
    | 'batteryStatus'
    | 'longSerialNumber';

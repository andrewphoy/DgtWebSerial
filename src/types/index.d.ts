interface Window {
    dgt: Dgt;
}

interface Dgt {
    init(): void;
    pgn(): string;
    onMove?: (move: Move) => void;
}

interface Move {
    from: string;
    to: string;
    promotion?: PieceType;
    san: string;
}

// Type definitions for non-npm package Web Serial API based on spec and Chromium implementation 1.0
// Project: https://wicg.github.io/serial/
// Definitions by: Maciej Mroziński <https://github.com/maciejmrozinski>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/dom-serial/index.d.ts

type EventHandler = (event: Event) => void;

interface SerialPortInfoBase {
    serialNumber: string;
    manufacturer: string;
    locationId: string;
    vendorId: string;
    vendor: string;
    productId: string;
    product: string;
}

interface SerialPortFilter {
    usbVendorId: number;
    usbProductId?: number;
}

interface SerialPortInfo extends SerialPortInfoBase, SerialPortFilter { } // mix spec and Chromium implementation

type ParityType = 'none' | 'even' | 'odd' | 'mark' | 'space';

type FlowControlType = 'none' | 'hardware';

interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: ParityType;
    bufferSize?: number;
    flowControl?: FlowControlType;
}

interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    readonly readable: ReadableStream; // Chromium implementation (spec: in)
    readonly writable: WritableStream; // Chromium implementation (spec: out)
    getInfo(): Partial<SerialPortInfo>;
}

interface SerialPortRequestOptions {
    filters: SerialPortFilter[];
}

interface Serial extends EventTarget {
    onconnect: EventHandler;
    ondisconnect: EventHandler;
    getPorts(): Promise<SerialPort[]>;
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>; // Chromium implementation (spec: SerialOptions)
}

interface Navigator {
    readonly serial: Serial;
}

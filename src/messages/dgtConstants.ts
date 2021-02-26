const enum DgtConstants {
    None = 0x00,
    MessageBit = 0x80,
    BoardDump = 0x06,
    ClockTime = 0x0D,
    SerialNumber = 0x11,
    LongSerialNumber = 0x22,
    FieldUpdate = 0x0E,
    EeMoves = 0x0F,
    Version = 0x13,
    BusAddress = 0x10,
    Trademark = 0x12,
    BoardDump50B = 0x14,
    BoardDump50W = 0x15,
    BatteryStatus = 0x20,
}

const enum DgtMessageSize {
    Header = 3,
    SerialNumber = 8,
    Version = 5,
    BoardDump = 67,
    ClockTime = 10,
    FieldUpdate = 5,
}
const enum DgtCommands {
    SendReset = 0x40,
    SendBoard = 0x42,
    SendClockTime = 0x41,
    SendSerialNumber = 0x45,
    SendVersion = 0x4D,

    /**
     * Sends Field Update messages when pieces moves on the board
     */
    SendUpdateBoard = 0x44,

    /**
     * Sends all updates that happen including board and clock updates
     */
    SendAllUpdates = 0x43,

    /**
     * Sends Field Update messages and also Clock Time messages when the clock time changes
     */
    SendUpdateNice = 0x4B,
    
    SendEeMoves = 0x49,
}
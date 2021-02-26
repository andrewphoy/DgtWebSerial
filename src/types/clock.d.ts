interface ClockMetaInfo {
    clockConnected: boolean;
    clockRunning: boolean;
    batteryLow: boolean;
    leftToMove: boolean;
    leftPlayerTurn: boolean;
    rightPlayerTurn: boolean;
}

interface PlayerClockInfo {
    isRunning: boolean;
    playerToMove: boolean;
    hasFlagged: boolean;
    hasDelay: boolean;

    hours: number;
    minutes: number;
    seconds: number;
    time: number;
}
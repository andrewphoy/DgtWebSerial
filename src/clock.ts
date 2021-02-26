import { ClockTimeMessage } from "./messages/clockTimeMessage";

export default class Clock {

    public blackOnTop: boolean;
    public metaInfo!: ClockMetaInfo;
    public whiteClockInfo!: PlayerClockInfo;
    public blackClockInfo!: PlayerClockInfo;


    constructor(blackOnTop: boolean) {
        //console.log('BlackOnTop: ' + blackOnTop);
        this.blackOnTop = blackOnTop;
    }

    public isClockPress(msg: ClockTimeMessage, whiteToMove: boolean): boolean {
        if (!this.metaInfo.clockConnected || !this.metaInfo.clockRunning) {
            return false;
        }

        if (whiteToMove && !this.whiteClockInfo.isRunning) {
            return false;
        }
        if (!whiteToMove && !this.blackClockInfo.isRunning) {
            return false;
        }

        if (whiteToMove) {
            return this.blackOnTop ? msg.leftPlayerInfo.isRunning : msg.rightPlayerInfo.isRunning;
        } else {
            return this.blackOnTop ? msg.rightPlayerInfo.isRunning : msg.leftPlayerInfo.isRunning;
        }
    }

    public updateFromMessage(msg: ClockTimeMessage): void {
        this.metaInfo = msg.metaInfo;

        if (this.blackOnTop) {
            this.whiteClockInfo = msg.leftPlayerInfo;
            this.blackClockInfo = msg.rightPlayerInfo;
        } else {
            this.whiteClockInfo = msg.rightPlayerInfo;
            this.blackClockInfo = msg.leftPlayerInfo;
        }

        // this.rightClockInfo = msg.rightPlayerInfo;
        // this.leftClockInfo = msg.leftPlayerInfo;

        // if (this.blackOnTop) {
        //     this.WhiteTime = new TimeSpan(LeftClockInfo.Hours, LeftClockInfo.Minutes, LeftClockInfo.Seconds);
        //     this.BlackTime = new TimeSpan(RightClockInfo.Hours, RightClockInfo.Minutes, RightClockInfo.Seconds);
        //     this.WhiteIsRunning = LeftClockInfo.IsRunning;
        //     this.BlackIsRunning = RightClockInfo.IsRunning;
        //     this.WhiteHasFlagged = LeftClockInfo.HasFlagged;
        //     this.BlackHasFlagged = RightClockInfo.HasFlagged;
        // } else {
        //     this.BlackTime = new TimeSpan(LeftClockInfo.Hours, LeftClockInfo.Minutes, LeftClockInfo.Seconds);
        //     this.WhiteTime = new TimeSpan(RightClockInfo.Hours, RightClockInfo.Minutes, RightClockInfo.Seconds);
        //     this.BlackIsRunning = LeftClockInfo.IsRunning;
        //     this.WhiteIsRunning = RightClockInfo.IsRunning;
        //     this.BlackHasFlagged = LeftClockInfo.HasFlagged;
        //     this.WhiteHasFlagged = RightClockInfo.HasFlagged;
        // }
    }
}
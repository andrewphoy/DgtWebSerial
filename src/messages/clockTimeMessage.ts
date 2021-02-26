import { DgtMessageBase } from "./dgtMessage";
import { bcdDecode } from "./../utils";

export class ClockTimeMessage extends DgtMessageBase {
/*
    from DGT library header
    byte 0: DGT_MSG_BWTIME
    byte 1: LLH_SEVEN(DGT_SIZE_BWTIME) (=0 fixed)
    byte 2: LLL_SEVEN(DGT_SIZE_BWTIME) (=10 fixed)
    byte 3:
    D4: 1 = Flag fallen for left player, and clock blocked to zero
    0 = not the above situation
    D5: 1 = Time per move indicator on for left player ( i.e. Bronstein, Fischer)
    0 = Time per move indicator off for left player
    D6: 1 = Left players flag fallen and indicated on display 
    0 = not the above situation
    (D7 is MSB)
    D0-D3: Hours (units, 0-9 Binary coded) white player (or player at the A side of the board)
    byte 4: Minutes (0-59, BCD coded)
    byte 5: Seconds (0-59, BCD coded)

    byte 6-8: the same for the other player

    byte 9: Clock status byte: 7 bits
    D0 (LSB): 1 = Clock running
    0 = Clock stopped by Start/Stop
    D1: 1 = tumbler position high on (white) player (front view: \ , left side high)
    0 = tumbler position high on the other player (front view: /, right side high)
    D2: 1 = Battery low indication on display
    0 = no battery low indication on display
    D3: 1 = Black players turn
    0 = not black players turn
    D4: 1 = White players turn
    0 = not white players turn
    D5: 1 = No clock connected; reading invalid
    0 = clock connected, reading valid
    D6: not used (read as 0)
    D7:  Always 0
    The function of the information bits are derived from the full information
    as described in the programmers reference manual for the DGT TopMatch 
*/

    public metaInfo!: ClockMetaInfo;
    public rightPlayerInfo!: PlayerClockInfo;
    public leftPlayerInfo!: PlayerClockInfo;


    public processPayloadBuffer(payload: Uint8Array): void {
        if (this.length != DgtMessageSize.ClockTime) {
            throw 'bad message size for clock time';
        }

        // parse the status flag first
        let statusByte = payload[6];
        let meta: ClockMetaInfo = {
            clockRunning: (statusByte & 1) > 0,
            leftToMove: (statusByte & 2) == 0,
            batteryLow: (statusByte & 4) > 0,
            rightPlayerTurn: (statusByte & 8) > 0,
            leftPlayerTurn: (statusByte & 16) > 0,
            clockConnected: (statusByte & 32) == 0,
        };

        this.metaInfo = meta;
        this.rightPlayerInfo = this.getPlayerClockInfo(payload.slice(0, 3), meta.rightPlayerTurn, meta.clockRunning);
        this.leftPlayerInfo = this.getPlayerClockInfo(payload.slice(3, 6), meta.leftPlayerTurn, meta.clockRunning);
    }

    private getPlayerClockInfo(data: Uint8Array, isPlayerTurn: boolean, isClockRunning: boolean): PlayerClockInfo {
        let hours = (data[0] & 15);
        let minutes = bcdDecode(data[1]);
        let seconds = bcdDecode(data[2]);

        return {
            hasFlagged: ((data[0] & 16) > 0) || ((data[0] & 64) > 0),
            hasDelay: (data[0] & 32) > 0,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            time: (hours * 3600) + (minutes * 60) + seconds,
            playerToMove: isPlayerTurn,
            isRunning: (isClockRunning && isPlayerTurn)
        };
    }
}
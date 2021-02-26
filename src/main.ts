import Dgt from './dgt';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Key } from 'chessground/types';

const dgt = window.dgt || new Dgt();
window.dgt = dgt;

let config = {
    viewOnly: true,
};
const chessground: Api = (<any>window).Chessground || Chessground(document.getElementById("board")!, config);
(<any>window).Chessground = chessground;

dgt.onMove = (move: Move) => {
    chessground.move(<Key>move.from, <Key>move.to);
    let textarea = document.getElementById('pgnbody');
    if (textarea) {
        textarea.innerHTML = dgt.pgn();
    }
}
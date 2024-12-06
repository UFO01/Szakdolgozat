const CS = 800; //vászon (tábla) mérete
const FL = {
    'r': '\u265C',
    'n': '\u265E',
    'b': '\u265D',
    'q': '\u265B',
    'k': '\u265A',
    'p': '\u265F',
    'R': '\u2656',
    'N': '\u2658',
    'B': '\u2657',
    'Q': '\u2655',
    'K': '\u2654',
    'P': '\u2659',
    'x': ''
}

const black_figures = ['r', 'n', 'b', 'q', 'k', 'p'];
const white_figures = ['R', 'N', 'B', 'Q', 'K', 'P'];
const coordinates_2D = [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], ['1', '2', '3', '4', '5', '6', '7', '8']
];

let canvas = document.getElementById("chesstable");
canvas.onclick = function semmit_nem_tesz(c) {
}
canvas.width = CS;
canvas.height = CS;
let ctx = canvas.getContext("2d");
let positions_of_figures_list = [];
let tmp = [];
let wob;
let pk;
let figure_row, figure_col;
let move_flag = false;
let king_move_boolean;
let position_string;
let moving = '';
let counter = 0;
let original_figure_row, original_figure_col;
let moved_figure_row, moved_figure_col;
let occupied_square;
let move;
let all_moves = [];
canvas.onclick = canvas_click;

function main(positions_of_figures, white_or_black, id) {
    position_string = positions_of_figures;
    document.getElementById('positions').value = positions_of_figures; //value
    positions_of_figures_list = [];
    for (let i = 0; i < 8; i++) {
        positions_of_figures_list.push(positions_of_figures.slice(i * 8, (i + 1) * 8).split(''));
    }
    console.log(positions_of_figures);
    pk = id;
    wob = white_or_black;
    draw_table();
    setInterval("api()", 3000);
    get_white_pieces_informations();
    get_black_pieces_informations();
    localStorage.setItem('all_moves', JSON.stringify(all_moves));
    var storedMoves = localStorage.getItem('all_moves');
    var retrievedMoves = JSON.parse(storedMoves);
    console.log(retrievedMoves);
    //AIPerformance();
    onedaycashback();
    //console.log(move('c1b2'));
}

document.getElementById("reset").onclick = function () {
    main('rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR', 'New', pk)
}


function api() {
    //console.log("Lefutott egy AJAX kérés");
    $.ajax({
        url: 'api',
        data: {
            'pk': pk
        },
        dataType: 'json',
        success: function (data) {
            if (data.reload) {
                window.location.href = '';
            }
        }
    })
}

function draw_table() {
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#BBB";

    for (let i = 0; i < 8; i += 2) { // szürke négyzetek színezése
        for (let j = 1; j < 8; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i += 2) { //  fehér négyzetek színezése
        for (let j = 0; j < 9; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#000"; // bábuk színei
    ctx.font = "100px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i < 8; i++) { // babuk pozícionálása
        for (let j = 0; j < 8; j++) {
            ctx.fillText(FL[positions_of_figures_list[i][j]], j * CS / 8 + CS / 16, i * CS / 8 + CS / 16 + CS / 23);
        }
    }
}


function canvas_click(event) {
    let vilagos_lehetosegek = get_white_pieces_informations();
    let sotet_lehetosegek = get_black_pieces_informations();
    console.log(vilagos_lehetosegek);
    let szerepel = false;
    let valid = true;
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor(((event.clientX - rect.left) / (rect.right - rect.left)) * CS);
    let y = Math.floor(((event.clientY - rect.top) / (rect.bottom - rect.top)) * CS);

    let row = parseInt(y / (CS / 8)); // hanyas sor / oszlop
    let col = parseInt(x / (CS / 8));

    console.log(row, col);
    console.log(coordinates_2D[0][col] + coordinates_2D[1][7 - row]);
    if (move_flag === false) { //nincs kijelölve
        if (positions_of_figures_list[row][col] !== 'x') {
            if ((wob === "White" && black_figures.includes(positions_of_figures_list[row][col])) ||
                ((wob === "Black" || wob === "New") && white_figures.includes(positions_of_figures_list[row][col]))) {
                ctx.beginPath();
                ctx.lineWidth = "10";
                ctx.strokeStyle = "darkred";
                ctx.rect(col * CS / 8, row * CS / 8, CS / 8, CS / 8);
                ctx.stroke();
                move_flag = true;
                figure_row = row;
                figure_col = col;
                if (counter === 0) {
                    original_figure_row = row;
                    original_figure_col = col;
                    console.log(original_figure_row, original_figure_col);
                    counter++;
                }
                console.log(coordinates_2D[0][original_figure_col] + coordinates_2D[1][7 - original_figure_row]);
            }
        }
    } else { // ki van jelölve
        if (row === figure_row && col === figure_col) { //deaktiválja a kijelölést
            draw_table();
            move_flag = false;
        } else { //áthelyezi a bábut
            console.log(moving);
            if (moving === '') {
                moving = coordinates_2D[0][col] + coordinates_2D[1][7 - row];
                occupied_square = positions_of_figures_list[row][col];
                positions_of_figures_list[row][col] = positions_of_figures_list[figure_row][figure_col];
                positions_of_figures_list[figure_row][figure_col] = 'x';
                move = coordinates_2D[0][original_figure_col] + coordinates_2D[1][7 - original_figure_row] + (occupied_square !== 'x' ? 'x' : '') + coordinates_2D[0][col] + coordinates_2D[1][7 - row];
                console.log(move);
                if (wob === "White") {
                    for (let i = 0; i < sotet_lehetosegek.length; i++) {
                        for (let j = 0; j < sotet_lehetosegek[i].length; j++) {
                            if (sotet_lehetosegek[i][j] === move) {
                                szerepel = true;
                                break;
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < vilagos_lehetosegek.length; i++) {
                        for (let j = 0; j < vilagos_lehetosegek[i].length; j++) {
                            if (vilagos_lehetosegek[i][j] === move) {
                                szerepel = true;
                                break;
                            }
                        }
                    }
                }

                if (check_for_checks() || !szerepel) {
                    valid = false;
                    positions_of_figures_list[figure_row][figure_col] = positions_of_figures_list[row][col];
                    positions_of_figures_list[row][col] = 'x';
                    moving = '';
                }
                if (valid) {
                    all_moves.push(move);
                }
                document.getElementById('positions').value = positions_of_figures_list.toString().replaceAll(',', '');
            }
            if (moving === coordinates_2D[0][figure_col] + coordinates_2D[1][7 - figure_row] && row === original_figure_row && col === original_figure_col) {
                all_moves.pop();
                positions_of_figures_list[row][col] = positions_of_figures_list[figure_row][figure_col];
                if (occupied_square === undefined) {
                    positions_of_figures_list[figure_row][figure_col] = 'x';
                } else {
                    positions_of_figures_list[figure_row][figure_col] = occupied_square;
                    occupied_square = undefined;
                }
                moving = '';
                counter--;
            }
            console.log(all_moves);
            draw_table();
            move_flag = false;
        }

    }
    document.getElementById('positions').value = positions_of_figures_list.toString().replaceAll(',', '');
}

function check_for_checks() {
    let vilagos_lehetosegek = get_white_pieces_informations();
    let sotet_lehetosegek = get_black_pieces_informations();
    let white_king_pos = get_white_king_position();
    let black_king_pos = get_black_king_position();
    let sakk = false;
    if (wob === "Black" || wob === "New") {
        for (let i = 0; i < sotet_lehetosegek.length; i++) { //megnézzük sötét lehetséges lépésit
            for (let j = 0; j < sotet_lehetosegek[i].length; j++) {
                if (king_move_boolean) {
                    white_king_pos = get_white_king_position();
                    if (sotet_lehetosegek[i][j].split('x')[1] === white_king_pos) {
                        sakk = true;
                    }
                } else {
                    if (sotet_lehetosegek[i][j].split('x')[1] === white_king_pos) sakk = true;
                }
            }
        }
        console.log("Világos sakkban: " + sakk);
    } else if (wob === "White") {
        for (let i = 0; i < vilagos_lehetosegek.length; i++) { //világos lépései
            for (let j = 0; j < vilagos_lehetosegek[i].length; j++) {
                if (king_move_boolean) {
                    black_king_pos = get_black_king_position();
                    if (vilagos_lehetosegek[i][j].split('x')[1] === black_king_pos) sakk = true;
                }
                if (vilagos_lehetosegek[i][j].split('x')[1] === black_king_pos) sakk = true;
            }
        }
        console.log("Sötét sakkban: " + sakk);
        console.log(get_black_pieces_informations());
    }
    return sakk;
}

function get_white_pieces_informations(list = positions_of_figures_list) {
    let whitelist = [];
    let every_legal_move = [];
    whitelist.push(get_white_king_position(list));
    whitelist.push(get_white_queens_positions(list));
    whitelist.push(get_white_rooks_positions(list));
    whitelist.push(get_white_bishops_positions(list));
    whitelist.push(get_white_knights_positions(list));
    whitelist.push(get_white_pawns_positions(list));
    for (let i = 0; i < whitelist.length; i++) {
        if (whitelist[i] instanceof Array) {
            for (let j = 0; j < whitelist[i].length; j++) {
                every_legal_move.push(legal_moves(whitelist[i][j]));
            }

        } else
            every_legal_move.push(legal_moves(whitelist[i]));
    }
    return every_legal_move;
}

function get_black_pieces_informations(list = positions_of_figures_list) {
    let blacklist = [];
    let every_legal_move = [];
    blacklist.push(get_black_king_position(list));
    blacklist.push(get_black_queens_positions(list));
    blacklist.push(get_black_rooks_positions(list));
    blacklist.push(get_black_bishops_positions(list));
    blacklist.push(get_black_knights_positions(list));
    blacklist.push(get_black_pawns_positions(list));
    for (let i = 0; i < blacklist.length; i++) {
        for (let j = 0; j < blacklist[i].length; j++) {
            every_legal_move.push(legal_moves(blacklist[i][j]));
        }
    }
    every_legal_move.push(legal_moves(get_black_king_position()));
    return every_legal_move;
}

function get_white_king_position(list = positions_of_figures_list) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (list[i][j] === 'K') {
                return coordinates_2D[0][j] + coordinates_2D[1][7 - i];
            }
        }
    }
}

function get_black_king_position() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'k') {
                return coordinates_2D[0][j] + coordinates_2D[1][7 - i];
            }
        }
    }
}

function get_white_queens_positions() {
    let vilagos_vezerek = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'Q') {
                vilagos_vezerek.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return vilagos_vezerek;
}

function get_black_queens_positions() {
    let sotet_vezerek = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'q') {
                sotet_vezerek.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return sotet_vezerek;
}

function get_white_rooks_positions() {
    let vilagos_bastyak = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'R') {
                vilagos_bastyak.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return vilagos_bastyak;
}

function get_black_rooks_positions() {
    let sotet_bastyak = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'r') {
                sotet_bastyak.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return sotet_bastyak;
}

function get_white_bishops_positions() {
    let vilagos_futok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'B') {
                vilagos_futok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return vilagos_futok;
}

function get_black_bishops_positions() {
    let sotet_futok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'b') {
                sotet_futok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return sotet_futok;
}

function get_white_knights_positions() {
    let vilagos_huszarok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'N') {
                vilagos_huszarok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return vilagos_huszarok;
}

function get_black_knights_positions() {
    let sotet_huszarok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'n') {
                sotet_huszarok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return sotet_huszarok;
}

function get_white_pawns_positions() {
    let vilagos_gyalogok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'P') {
                vilagos_gyalogok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return vilagos_gyalogok;
}

function get_black_pawns_positions() {
    let sotet_gyalogok = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'p') {
                sotet_gyalogok.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return sotet_gyalogok;
}

function get_empty_squares() {
    let ures = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'x') {
                ures.push(coordinates_2D[0][j] + coordinates_2D[1][7 - i]);
            }
        }
    }
    return ures;
}

function legal_moves(coordinate) {
    let legal_moves_per_coordinate = [];

    coordinate.split('');
    //i függőleges elmozdulás, j vízszintes elmozdulás, a8:0,0 és h1:7,7, h8:0,7, a1:7,0
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (coordinate[0] === coordinates_2D[0][j] && coordinate[1] === coordinates_2D[1][7 - i]) { //megtalálta
                if (positions_of_figures_list[i][j] === 'x') {
                } else if (positions_of_figures_list[i][j] === 'p') {
                    if (positions_of_figures_list[i + 1][j] === 'x') { //tud előre lépni
                        legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][6 - i]);

                        if (coordinate[1] === '7' && positions_of_figures_list[i + 2][j] === 'x') { //tud előre kettőt lépni
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][5 - i]);
                        }
                    }
                    if (positions_of_figures_list[i + 1][j + 1] !== 'x' && positions_of_figures_list[i + 1][j + 1] !== undefined && white_figures.includes(positions_of_figures_list[i + 1][j + 1]) && positions_of_figures_list[i + 1][j + 1] !== undefined) { //tud jobbra ütni
                        legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][6 - i])
                    }
                    if (positions_of_figures_list[i + 1][j - 1] !== 'x' && positions_of_figures_list[i + 1][j - 1] !== undefined && white_figures.includes(positions_of_figures_list[i + 1][j - 1]) && positions_of_figures_list[i + 1][j - 1] !== undefined) { //tud balra ütni
                        legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][6 - i]);
                    }
                } else if (positions_of_figures_list[i][j] === 'n') { //8 eset L-alakra
                    if (coordinates_2D[0][j + 2] !== undefined && coordinates_2D[1][6 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 1][j + 2]) && positions_of_figures_list[i + 1][j + 2] !== undefined /*és nincs abszolút kötésben*/) { //kettőt jobbra, egyet le
                        if (white_figures.includes(positions_of_figures_list[i + 1][j + 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 2] + coordinates_2D[1][6 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 2] + coordinates_2D[1][6 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 2] !== undefined && coordinates_2D[1][6 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 1][j - 2]) && positions_of_figures_list[i + 1][j - 2] !== undefined /*és nincs abszolút kötésben*/) { //kettőt balra, egyet le
                        if (white_figures.includes(positions_of_figures_list[i + 1][j - 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 2] + coordinates_2D[1][6 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 2] + coordinates_2D[1][6 - i]);
                        }
                    }
                    if (coordinates_2D[0][j + 2] !== undefined && coordinates_2D[1][8 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 1][j + 2]) && positions_of_figures_list[i - 1][j + 2] !== undefined  /*és nincs abszolút kötésben*/) {
                        if (white_figures.includes(positions_of_figures_list[i - 1][j + 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 2] + coordinates_2D[1][8 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 2] + coordinates_2D[1][8 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 2] !== undefined && coordinates_2D[1][8 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 1][j - 2] && positions_of_figures_list[i - 1][j - 2] !== undefined) /*és nincs abszolút kötésben*/) {
                        if (white_figures.includes(positions_of_figures_list[i - 1][j - 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 2] + coordinates_2D[1][8 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 2] + coordinates_2D[1][8 - i]); //kettőt balra, egyet fel
                        }
                    }
                    if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][5 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 2][j + 1]) && positions_of_figures_list[i + 2][j + 1] !== undefined /*és nincs abszolút kötésben*/) {
                        if (white_figures.includes(positions_of_figures_list[i + 2][j + 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][5 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][5 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][5 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 2][j - 1]) && positions_of_figures_list[i + 2][j - 1] !== undefined /*és nincs abszolút kötésben*/) {
                        if (white_figures.includes(positions_of_figures_list[i + 2][j - 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][5 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][5 - i]);
                        }
                    }
                    if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][9 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 2][j + 1] && positions_of_figures_list[i - 2][j + 1] !== undefined) /*és nincs abszolút kötésben*/) { //egyet jobbra, kettőt fel
                        if (white_figures.includes(positions_of_figures_list[i - 2][j + 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][9 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][9 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][9 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 2][j - 1] && positions_of_figures_list[i - 2][j - 1] !== undefined) /*és nincs abszolút kötésben*/) {//egyet balra, kettőt fel
                        if (white_figures.includes(positions_of_figures_list[i - 2][j - 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][9 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][9 - i]);
                        }
                    }
                    continue;
                } else if (positions_of_figures_list[i][j] === 'b') {
                    if (true /*és nincs abszolút kötésben főátlóra, vagy vízszintesen vagy függőlegesen*/) {
                        let k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j + k]) && positions_of_figures_list[i + k][j + k] !== undefined) { //jobbra le
                            if (white_figures.includes(positions_of_figures_list[i + k][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                                k++;
                            }
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j - k]) && positions_of_figures_list[i - k][j - k] !== undefined) { //balra fel
                        if (white_figures.includes(positions_of_figures_list[i - k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            k++;
                        }
                    }
                    if (true /*és nincs abszolút kötésben mellékátlóra vagy vízsinztesen vagy függőlegesen*/) {
                        let k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j + k]) && positions_of_figures_list[i - k][j + k] !== undefined) { //jobbra fel
                            if (white_figures.includes(positions_of_figures_list[i - k][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j - k]) && positions_of_figures_list[i + k][j - k] !== undefined) { //balra le
                        if (white_figures.includes(positions_of_figures_list[i + k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                        k++;
                    }
                } else if (positions_of_figures_list[i][j] === 'r') {
                    if (true /*és nincs vízszintesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j]) && positions_of_figures_list[i + k][j] !== undefined) { //le
                            if (white_figures.includes(positions_of_figures_list[i + k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j]) && positions_of_figures_list[i - k][j] !== undefined) { //fel
                            if (white_figures.includes(positions_of_figures_list[i - k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                    }
                    if (true /*és nincs függőlegesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j - k]) && positions_of_figures_list[i][j - k] !== undefined) { //balra
                            if (white_figures.includes(positions_of_figures_list[i][j - k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + +coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j + k]) && positions_of_figures_list[i][j + k] !== undefined) { //jobbra
                            if (white_figures.includes(positions_of_figures_list[i][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                    }
                } else if (positions_of_figures_list[i][j] === 'q') {
                    let k = 1;
                    while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j + k]) && positions_of_figures_list[i + k][j + k] !== undefined) { //jobbra le
                        if (white_figures.includes(positions_of_figures_list[i + k][j + k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            k++;
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j - k]) && positions_of_figures_list[i - k][j - k] !== undefined) { //balra fel
                        if (white_figures.includes(positions_of_figures_list[i - k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            k++;
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j + k]) && positions_of_figures_list[i - k][j + k] !== undefined) { //jobbra fel
                        if (white_figures.includes(positions_of_figures_list[i - k][j + k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                            k++;
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j - k]) && positions_of_figures_list[i + k][j - k] !== undefined) { //balra le
                        if (white_figures.includes(positions_of_figures_list[i + k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                        k++;
                    }
                    if (true /*és nincs vízszintesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !black_figures.includes(positions_of_figures_list[i + k][j]) && positions_of_figures_list[i + k][j] !== undefined) { //le
                            if (white_figures.includes(positions_of_figures_list[i + k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !black_figures.includes(positions_of_figures_list[i - k][j]) && positions_of_figures_list[i - k][j] !== undefined) { //fel
                            if (white_figures.includes(positions_of_figures_list[i - k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                    }
                    if (true /*és nincs függőlegesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j - k]) && positions_of_figures_list[i][j - k] !== undefined) { //balra
                            if (white_figures.includes(positions_of_figures_list[i][j - k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j + k]) && positions_of_figures_list[i][j + k] !== undefined) { //jobbra
                            if (white_figures.includes(positions_of_figures_list[i][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                    }
                } else if (positions_of_figures_list[i][j] === 'k') {
                    if (true /*és nem lép sakkba*/) {
                        if (coordinates_2D[0][j] !== undefined && coordinates_2D[1][6 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 1][j]) && positions_of_figures_list[i + 1][j] !== undefined) { //le
                            if (white_figures.includes(positions_of_figures_list[i + 1][j])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][6 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][6 - i]);
                        }
                        if (coordinates_2D[0][j] !== undefined && coordinates_2D[1][8 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 1][j]) && positions_of_figures_list[i - 1][j] !== undefined) { //fel
                            if (white_figures.includes(positions_of_figures_list[i - 1][j])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][8 - i]);
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j - 1]) && positions_of_figures_list[i][j - 1] !== undefined) { //balra
                            if (white_figures.includes(positions_of_figures_list[i][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][7 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][7 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][7 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i][j + 1]) && positions_of_figures_list[i][j + 1] !== undefined) { //jobbra
                            if (white_figures.includes(positions_of_figures_list[i][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][7 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][7 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][6 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 1][j + 1]) && positions_of_figures_list[i + 1][j + 1] !== undefined) { //jobbra le
                            if (white_figures.includes(positions_of_figures_list[i + 1][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][6 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][6 - i]);
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][8 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 1][j - 1]) && positions_of_figures_list[i - 1][j - 1] !== undefined) { //balra fel
                            if (white_figures.includes(positions_of_figures_list[i - 1][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][8 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][8 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i - 1][j + 1]) && positions_of_figures_list[i - 1][j + 1] !== undefined) { //jobbra fel
                            if (white_figures.includes(positions_of_figures_list[i - 1][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][8 - i]);
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][6 - i] !== undefined && !black_figures.includes(positions_of_figures_list[i + 1][j - 1]) && positions_of_figures_list[i + 1][j - 1] !== undefined) { //balra le
                            if (white_figures.includes(positions_of_figures_list[i + 1][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][6 - i]);
                            else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][6 - i]);
                            }
                        }
                    }
                } else if (positions_of_figures_list[i][j] === 'P') {
                    if (positions_of_figures_list[i - 1][j] === 'x' /*és nincs abszolút kötésben*/) { //tud előre lépni
                        legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][8 - i]);

                        if (coordinate[1] === '2' && positions_of_figures_list[i - 2][j] === 'x') { //tud előre kettőt lépni
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][9 - i]);
                        }
                    }
                    if (positions_of_figures_list[i - 1][j + 1] !== 'x' && positions_of_figures_list[i - 1][j + 1] !== undefined && black_figures.includes(positions_of_figures_list[i - 1][j + 1]) && positions_of_figures_list[i - 1][j + 1] !== undefined) { //tud jobbra ütni
                        legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][8 - i])
                    }
                    if (positions_of_figures_list[i - 1][j - 1] !== 'x' && positions_of_figures_list[i - 1][j - 1] !== undefined && black_figures.includes(positions_of_figures_list[i - 1][j - 1]) && positions_of_figures_list[i - 1][j - 1] !== undefined) { //tud balra ütni
                        legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][8 - i]);
                    }
                    continue;
                } else if (positions_of_figures_list[i][j] === 'N') {
                    if (coordinates_2D[0][j + 2] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 1][j + 2] && positions_of_figures_list[i + 1][j + 2] !== undefined) /*és nincs abszolút kötésben*/) { //kettőt jobbra, egyet le
                        if (black_figures.includes(positions_of_figures_list[i + 1][j + 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 2] + coordinates_2D[1][6 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 2] + coordinates_2D[1][6 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 2] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 1][j - 2]) && positions_of_figures_list[i + 1][j - 2] !== undefined /*és nincs abszolút kötésben*/) { //kettőt balra, egyet le
                        if (black_figures.includes(positions_of_figures_list[i + 1][j - 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 2] + coordinates_2D[1][6 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 2] + coordinates_2D[1][6 - i]);
                        }
                    }
                    if (coordinates_2D[0][j + 2] !== undefined && coordinates_2D[1][8 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 1][j + 2]) && positions_of_figures_list[i - 1][j + 2] !== undefined /*és nincs abszolút kötésben*/) {
                        if (black_figures.includes(positions_of_figures_list[i - 1][j + 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 2] + coordinates_2D[1][8 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 2] + coordinates_2D[1][8 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 2] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 1][j - 2]) && positions_of_figures_list[i - 1][j - 2] !== undefined /*és nincs abszolút kötésben*/) {
                        if (black_figures.includes(positions_of_figures_list[i - 1][j - 2])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 2] + coordinates_2D[1][8 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 2] + coordinates_2D[1][8 - i]); //kettőt balra, egyet fel
                        }
                    }
                    if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][5 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 2][j + 1] && positions_of_figures_list[i + 2][j + 1] !== undefined) /*és nincs abszolút kötésben*/) {
                        if (black_figures.includes(positions_of_figures_list[i + 2][j + 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][5 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][5 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][5 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 2][j - 1]) && positions_of_figures_list[i + 2][j - 1] !== undefined /*és nincs abszolút kötésben*/) {
                        if (black_figures.includes(positions_of_figures_list[i + 2][j - 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][5 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][5 - i]);
                        }
                    }
                    if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][9 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 2][j + 1] && positions_of_figures_list[i - 2][j + 1] !== undefined) /*és nincs abszolút kötésben*/) { //egyet jobbra, kettőt fel
                        if (black_figures.includes(positions_of_figures_list[i - 2][j + 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][9 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][9 - i]);
                        }
                    }
                    if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][9 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 2][j - 1] && positions_of_figures_list[i - 2][j - 1] !== undefined) /*és nincs abszolút kötésben*/) {//egyet balra, kettőt fel
                        if (black_figures.includes(positions_of_figures_list[i - 2][j - 1])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][9 - i]);
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][9 - i]);
                        }
                    }

                } else if (positions_of_figures_list[i][j] === 'B') {
                    let k = 1;
                    while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j + k]) && positions_of_figures_list[i + k][j + k] !== undefined) { //jobbra le
                        if (black_figures.includes(positions_of_figures_list[i + k][j + k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            k++;
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j - k]) && positions_of_figures_list[i - k][j - k] !== undefined) { //balra fel
                        if (black_figures.includes(positions_of_figures_list[i - k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            k++;
                        }
                    }
                    if (true /*és nincs abszolút kötésben mellékátlóra vagy vízsinztesen vagy függőlegesen*/) {
                        let k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j + k]) && positions_of_figures_list[i - k][j + k] !== undefined) { //jobbra fel
                            if (black_figures.includes(positions_of_figures_list[i - k][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j - k]) && positions_of_figures_list[i + k][j - k] !== undefined) { //balra le
                        if (black_figures.includes(positions_of_figures_list[i + k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                        k++;
                    }
                } else if (positions_of_figures_list[i][j] === 'R') {
                    if (true /*és nincs vízszintesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j]) && positions_of_figures_list[i + k][j] !== undefined) { //le
                            if (black_figures.includes(positions_of_figures_list[i + k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j]) && positions_of_figures_list[i - k][j] !== undefined) { //fel
                            if (black_figures.includes(positions_of_figures_list[i - k][j])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                    }
                    if (true /*és nincs függőlegesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                        let k = 1;
                        while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j - k]) && positions_of_figures_list[i][j - k] !== undefined) { //balra
                            if (black_figures.includes(positions_of_figures_list[i][j - k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j + k]) && positions_of_figures_list[i][j + k] !== undefined) { //jobbra
                            if (black_figures.includes(positions_of_figures_list[i][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                k++;
                            }
                        }
                    }
                } else if (positions_of_figures_list[i][j] === 'Q') {
                    let k = 1;
                    while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j + k]) && positions_of_figures_list[i + k][j + k] !== undefined) { //jobbra le
                        if (black_figures.includes(positions_of_figures_list[i + k][j + k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i - k]);
                            k++;
                        }
                    }
                    k = 1;
                    while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j - k]) && positions_of_figures_list[i - k][j - k] !== undefined) { //balra fel
                        if (black_figures.includes(positions_of_figures_list[i - k][j - k])) {
                            legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            break;
                        } else {
                            legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i + k]);
                            k++;
                        }
                    }
                    if (true /*és nincs abszolút kötésben mellékátlóra vagy vízsinztesen vagy függőlegesen*/) {
                        let k = 1;
                        while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j + k]) && positions_of_figures_list[i - k][j + k] !== undefined) { //jobbra fel
                            if (black_figures.includes(positions_of_figures_list[i - k][j + k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                break;
                            } else {
                                legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i + k]);
                                k++;
                            }
                        }
                        k = 1;
                        while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j - k]) && positions_of_figures_list[i + k][j - k] !== undefined) { //balra le
                            if (black_figures.includes(positions_of_figures_list[i + k][j - k])) {
                                legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                                break;
                            } else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i - k]);
                            k++;
                        }
                        if (true /*és nincs vízszintesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                            let k = 1;
                            while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i - k] !== undefined && !white_figures.includes(positions_of_figures_list[i + k][j]) && positions_of_figures_list[i + k][j] !== undefined) { //le
                                if (black_figures.includes(positions_of_figures_list[i + k][j])) {
                                    legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                    break;
                                } else {
                                    legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i - k]);
                                    k++;
                                }
                            }
                            k = 1;
                            while (coordinates_2D[0][j] !== undefined && coordinates_2D[1][7 - i + k] !== undefined && !white_figures.includes(positions_of_figures_list[i - k][j]) && positions_of_figures_list[i - k][j] !== undefined) { //fel
                                if (black_figures.includes(positions_of_figures_list[i - k][j])) {
                                    legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                    break;
                                } else {
                                    legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][7 - i + k]);
                                    k++;
                                }
                            }
                        }
                        if (true /*és nincs függőlegesen vagy átlósan (főátló, mellékátló) abszolút kötésben*/) {
                            let k = 1;
                            while (coordinates_2D[0][j - k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j - k]) && positions_of_figures_list[i][j - k] !== undefined) { //balra
                                if (black_figures.includes(positions_of_figures_list[i][j - k])) {
                                    legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                    break;
                                } else {
                                    legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - k] + coordinates_2D[1][7 - i]);
                                    k++;
                                }
                            }
                            k = 1;
                            while (coordinates_2D[0][j + k] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j + k]) && positions_of_figures_list[i][j + k] !== undefined) { //jobbra
                                if (black_figures.includes(positions_of_figures_list[i][j + k])) {
                                    legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                    break;
                                } else {
                                    legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + k] + coordinates_2D[1][7 - i]);
                                    k++;
                                }
                            }
                        }
                    }
                } else if (positions_of_figures_list[i][j] === 'K') {
                    if (true /*és nem lép sakkba*/) {
                        if (coordinates_2D[0][j] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 1][j]) && positions_of_figures_list[i + 1][j] !== undefined) { //le
                            if (black_figures.includes(positions_of_figures_list[i + 1][j])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][6 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][6 - i]);
                        }
                        if (coordinates_2D[0][j] !== undefined && coordinates_2D[1][8 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 1][j]) && positions_of_figures_list[i - 1][j] !== undefined) { //fel
                            if (black_figures.includes(positions_of_figures_list[i - 1][j])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j] + coordinates_2D[1][8 - i])
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j - 1]) && positions_of_figures_list[i][j - 1] !== undefined) { //balra
                            if (black_figures.includes(positions_of_figures_list[i][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][7 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][7 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][7 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i][j + 1]) && positions_of_figures_list[i][j + 1] !== undefined) { //jobbra
                            if (black_figures.includes(positions_of_figures_list[i][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][7 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][7 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 1][j + 1]) && positions_of_figures_list[i + 1][j + 1] !== undefined) { //jobbra le
                            if (black_figures.includes(positions_of_figures_list[i + 1][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][6 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][6 - i]);
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][8 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 1][j - 1]) && positions_of_figures_list[i - 1][j - 1] !== undefined) { //balra fel
                            if (black_figures.includes(positions_of_figures_list[i - 1][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][8 - i]);
                        }
                        if (coordinates_2D[0][j + 1] !== undefined && coordinates_2D[1][8 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i - 1][j + 1]) && positions_of_figures_list[i - 1][j + 1] !== undefined) { //jobbra fel
                            if (black_figures.includes(positions_of_figures_list[i - 1][j + 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j + 1] + coordinates_2D[1][8 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j + 1] + coordinates_2D[1][8 - i]);
                        }
                        if (coordinates_2D[0][j - 1] !== undefined && coordinates_2D[1][6 - i] !== undefined && !white_figures.includes(positions_of_figures_list[i + 1][j - 1]) && positions_of_figures_list[i + 1][j - 1] !== undefined) { //balra le
                            if (black_figures.includes(positions_of_figures_list[i + 1][j - 1])) legal_moves_per_coordinate.push(coordinate + 'x' + coordinates_2D[0][j - 1] + coordinates_2D[1][6 - i]);
                            else legal_moves_per_coordinate.push(coordinate + coordinates_2D[0][j - 1] + coordinates_2D[1][6 - i]);
                        }
                    }
                }
            }
        }
    }
    return legal_moves_per_coordinate;
}





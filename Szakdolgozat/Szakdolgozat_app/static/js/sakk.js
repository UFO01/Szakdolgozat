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
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
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
let wob;
let pk;
let figure_row, figure_col;
let move_flag = false;

canvas.onclick = canvas_click;

function main(positions_of_figures, white_or_black, id) {
    document.getElementById('positions').value = positions_of_figures; //value
    positions_of_figures_list = [];
    for (let i = 0; i < 8; i++) {
        positions_of_figures_list.push(positions_of_figures.slice(i * 8, (i + 1) * 8).split(''));
    }
    coordinates('e8', positions_of_figures_list);
    pk = id;
    wob = white_or_black;
    draw_table();
    setInterval("api()", 3000);
    legal_moves();
}

document.getElementById("reset").onclick = function () {
    main('rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR', 'New', pk)
}


function api() {
    console.log("Hello")
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

    for (let i = 0; i < 8; i += 2) { // szurke negyzetek szinezese
        for (let j = 1; j < 8; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i += 2) { //  feher negyzetek szinezese
        for (let j = 0; j < 9; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#000"; // babuk szinei
    ctx.font = "100px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i < 8; i++) { // babuk pozicionalasa
        for (let j = 0; j < 8; j++) {
            ctx.fillText(FL[positions_of_figures_list[i][j]], j * CS / 8 + CS / 16, i * CS / 8 + CS / 16 + CS / 23);
        }
    }
}


function canvas_click(event) {

    let rect = canvas.getBoundingClientRect();
    x = Math.floor(((event.clientX - rect.left) / (rect.right - rect.left)) * CS);
    y = Math.floor(((event.clientY - rect.top) / (rect.bottom - rect.top)) * CS);

    let row = parseInt(y / (CS / 8)); // hanyas sor / oszlop bal felulrol kszamova 0,0 rol
    let col = parseInt(x / (CS / 8));
    console.log(row, col);
    console.log(coordinates_2D[0][col] + coordinates_2D[1][7 - row]);

    if (move_flag === false) {
        console.log("False a move_flag --> még nincs kijelolve babu");// nincs jelolve a babu
        if (positions_of_figures_list[row][col] !== 'x') {
            console.log("Nem üres mező");
            if ((wob === "White" && black_figures.includes(positions_of_figures_list[row][col])) ||
                ((wob === "Black" || wob === "New") && white_figures.includes(positions_of_figures_list[row][col]))) {
                console.log("Kijelölés");
                ctx.beginPath();
                ctx.lineWidth = "10";
                ctx.strokeStyle = "darkred";
                ctx.rect(col * CS / 8, row * CS / 8, CS / 8, CS / 8);
                ctx.stroke();
                move_flag = true;
                figure_row = row;
                figure_col = col;
            }
        } else {
            let res = prompt('Rescued figure (r, n, b, q, k, p, R, N, B, Q, K, P, x):');
            positions_of_figures_list[row][col] = (['r', 'n', 'b', 'q', 'k', 'p', 'R', 'N', 'B', 'Q', 'K', 'P', 'x'].includes(res) ? res : 'x');
            draw_table();
        }
    } else { // ki van jelolve a babu
        if (row === figure_row && col === figure_col) {
            console.log("Kijelölés vissza");
            draw_table();
            move_flag = false;
        } else {
            console.log("Átmozgatás");
            positions_of_figures_list[row][col] = positions_of_figures_list[figure_row][figure_col];
            positions_of_figures_list[figure_row][figure_col] = 'x';
            draw_table();
            move_flag = false;
        }
    }
}

document.getElementById('positions').value = positions_of_figures_list.toString().replaceAll(',', '');
console.log(positions_of_figures_list);


function get_white_king_position() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'K') {
                console.log("Világos király " + coordinates_2D[0][8 - j] + coordinates_2D[1][7 - i] + '-n!');
                return coordinates_2D[0][j] + coordinates_2D[1][7 - i];
            }
        }
    }
}

function get_black_king_position() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (positions_of_figures_list[i][j] === 'k') {
                console.log("Sötét király: " + coordinates_2D[0][8 - j] + coordinates_2D[1][7 - i]);
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
    console.log("Világos vezér(ek): " + vilagos_vezerek);
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
    console.log("Sötét vezér(ek): " + sotet_vezerek);
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
    console.log("Világos bástyák: " + vilagos_bastyak);
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
    console.log("Sötét bástyák: " + sotet_bastyak);
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
    console.log("Világos futók: " + vilagos_futok);
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
    console.log("Sötét futók: " + sotet_futok);
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
    console.log("Világos huszárok: " + vilagos_huszarok);
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
    console.log("Sötét huszárok: " + sotet_huszarok);
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
    console.log("Világos gyalogok: " + vilagos_gyalogok);
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
    console.log("Sötét gyalogok: " + sotet_gyalogok);
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
    console.log("Üres mezők: " + ures);
    return ures;
}

function coordinates(coordinate) { //pl. f3-ra kiadja, hogy világos huszár
    coordinate.split('');
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (coordinate[0] === coordinates_2D[0][j] && coordinate[1] === coordinates_2D[1][7 - i]) {
                if (positions_of_figures_list[i][j] === 'k') {
                    console.log(coordinate + ": Sötét király");
                } else if (positions_of_figures_list[i][j] === 'K') {
                    console.log(coordinate + ": Világos király");
                } else if (positions_of_figures_list[i][j] === 'q') {
                    console.log(coordinate + ": Sötét vezér");
                } else if (positions_of_figures_list[i][j] === 'Q') {
                    console.log(coordinate + ": Világos vezér");
                } else if (positions_of_figures_list[i][j] === 'b') {
                    console.log(coordinate + ": Sötét futó");
                } else if (positions_of_figures_list[i][j] === 'B') {
                    console.log(coordinate + ": Világos futó");
                } else if (positions_of_figures_list[i][j] === 'n') {
                    console.log(coordinate + ": Sötét huszár");
                } else if (positions_of_figures_list[i][j] === 'N') {
                    console.log(coordinate + ": Világos huszár");
                } else if (positions_of_figures_list[i][j] === 'r') {
                    console.log(coordinate + ": Sötét bástya");
                } else if (positions_of_figures_list[i][j] === 'R') {
                    console.log(coordinate + ": Világos bástya");
                } else if (positions_of_figures_list[i][j] === 'p') {
                    console.log(coordinate + ": Sötét gyalog");
                } else if (positions_of_figures_list[i][j] === 'P') {
                    console.log(coordinate + ": Világos gyalog");
                } else console.log(coordinate + ": Semmi");
            }
        }
    }
}


function legal_moves() {
    let legal_moves_list = [];
    let segedtomb = [];
    if (wob === "White") { //sötét lép
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (black_figures.includes(positions_of_figures_list[i][j])) {
                    if (positions_of_figures_list[i][j] === 'k') {
                        legal_moves_list.push(get_black_king_position());
                    } else if (positions_of_figures_list[i][j] === 'q') {
                        segedtomb = get_black_queens_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'b') {
                        segedtomb = get_black_bishops_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'n') {
                        segedtomb = get_black_knights_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'r') {
                        segedtomb = get_black_rooks_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'p') {
                        segedtomb = get_black_pawns_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'x') {
                        get_empty_squares();
                    }
                }
            }
        }
        console.log("Sötét bábuk helye: " + legal_moves_list);
    } else if (wob === "Black" || wob === "New") { //világos lép
        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                if (white_figures.includes(positions_of_figures_list[i][j])) {
                    if (positions_of_figures_list[i][j] === 'K') {
                        segedtomb = get_white_king_position();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'Q') {
                        segedtomb = get_white_queens_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'B') {
                        segedtomb = get_white_bishops_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'N') {
                        segedtomb = get_white_knights_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'R') {
                        segedtomb = get_white_rooks_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'P') {
                        segedtomb = get_white_pawns_positions();
                        for (let k = 0; k < segedtomb.length; k++) {
                            if (!legal_moves_list.includes(segedtomb[k])) {
                                legal_moves_list.push(segedtomb[k]);
                            }
                        }
                    } else if (positions_of_figures_list[i][j] === 'x') {
                        get_empty_squares();
                    }
                }
                console.log(legal_moves_list);
            }
        }
    } else alert('Kijátszották a rendszert!');
    return legal_moves_list;
}


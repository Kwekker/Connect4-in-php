const colors = ["#777", "red", "yellow"];
let myName;
let opponent;
let youFirst; //If you had the first turn or not. This decides your color and when you can drop pieces.
let turn;     //The turn the game is on. Literally the second value in data.txt
let key;
let addButtons = false;

let debugThing;
let board;
let interval;

const States = {
    start: 0,
    waiting: 1,
    playing: 2
}
let state = 0;

addEventListener('beforeunload', (event) => {
    $.ajax({
        type: "POST",
        url: "update.php",
        data: {leave: 1, name: myName, key: key}
    });
});

function update() {
    if(state == States.waiting) {
        console.log("Wait update");
        if(!addButtons) {
            $.ajax({
                type: "POST",
                url: "choose.php",
                data: {can: 1, name: myName},
                success: function(data) {
                    let str = data + "";
                    console.log("I got ", str);
                    if(str.charAt(0) != '0' && str.charAt(0) != '1') {
                        console.log("Started playing against " + data);
                        opponent = data;
                        startPlaying(false);
                    }
                    else {
                        if(str.charAt(0) == '1') addButtons = true;
                        if(str.charAt(1) == '1') {
                            setNames(str.substring(2, str.indexOf(",")), str.substring(str.indexOf(",") + 1));
                        }
                        else setNames("", "");
                    }
                    
                },
            });
        }
        makeQueue();
    }
    else {
        console.log("Play update");
        updateBoard();
    }

    $.ajax({
        type: "POST",
        url: "update.php",
        data: {name: myName, key: key},
        success: function (data) {
            console.log(data);
            if(data == "badkey") {
                badKey();
            }
        }
    });
}


function updateBoard() {
    $.get("gameinfo.php", function(data, status) {
        let str = data + "";
        if(str.charAt(0) == '0') {
            gameMessage("Your opponent left the game lol.<br>Reload the page to re-enter the queue.<h6>I'm not going to be the one to implement a restart button lol</h6>", true);
            return;
        }
        turn = str.charAt(1) == '1';
        changeTurnIndicator(turn);
        board = str.substring(2);
        for(let j = 0; j < 6; j++) {
            for(let i = 0; i < 7; i++) {
                if(board[j * 7 + i]) {
                    changeColor(i, j, (0x0f & board[j * 7 + i]));
                }
            }
        }
    });
}


function drop(col) {
    if(state == States.playing && youFirst == turn) {
        console.log("Dropping piece on col " + col + "...");
        $.ajax({
            type: "POST",
            url: "drop.php",
            data: {name: myName, key: key, col: col},

            success: function (data) {
                let str = data + "";
                console.log(str);
                if(str == "badkey") badKey();
                else if(str == "fullcol") {
                    gameMessage("That column is already filled to the brim");
                }
                else if(str == "badturn") {
                    gameMessage("It's not your turn nerd.");
                }
                else if(str.startsWith("yes") || str.startsWith("win")) {
                    if(str.startsWith("win")) gameMessage("<h2>YOU FUCKING WON MATE</h2>");
                    str = str.substring(3);
                    changeColor(col, str.substring(1) & 0xf, !(str.charAt(0) & 0xf) + 1);
                    turn = !turn;
                    changeTurnIndicator(turn);
                }
                else gameMessage("php error apparently. Tell Jochem he's bad at coding");
            }
        });
    }
    else if(youFirst != turn) gameMessage("Your opponent is still contemplating their next move.");
    else if(state == States.start) gameMessage("You have to submit your name first :/");
    else if(state == States.waiting) gameMessage("You are still waiting in the queue..");
}


function makeQueue() {
    let queue = $("#queue");
    queue.empty();
    fetch('data/queue.txt?r=' + Math.random()).then((response) => response.text()).then((text) => {
        let array = text.split(":");
        for(let name of array) {
            name = name.trim();
            if(name.length < 2) continue;

            let el;
            if(!addButtons) {
                el = document.createElement("div");
                el.onclick = "chooseOpponent"
            }
            else el = document.createElement("button");

            if (name == myName)
                queue.append("<div class='me'>" + name + "</div>");
            else if(!addButtons) 
                queue.append("<div>" + name + "</div>");
            else
                queue.append("<button onclick='chooseOpponent(\"" + name + "\")'>" + name + "</button>");
        }
    });
}

function setNames(player0, player1) {
    console.log("length = ", player0.length);
    $("#player0").text(player0);
    if(player0.length > 10) $("#player0").css("font-size", "x-large");
    $("#player1").text(player1);
    if(player1.length > 10) $("#player1").css("font-size", "x-large");
}

function chooseOpponent(oppo) {
    $.ajax({
        type: "POST",
        url: "choose.php",
        data: {name: myName, key: key, oppo: oppo},
        success: function(data) {
            if(data == "yes") {
                opponent = oppo;
                addButtons = false;
                startPlaying(true);
            }
        },
    });
}

function startPlaying(yourTurn) {
    youFirst = yourTurn;
    turn = yourTurn;
    state = States.playing;
    let sideInfo = $("#sideinfo");
    sideInfo.empty();
    sideInfo.append("<h2>" + myName + "</h2><hr><h3>Playing against " + opponent + "</h3><div class='queue' id='queue'></div>");
    if(yourTurn) setNames(myName, opponent);
    else setNames(opponent, myName);
}

function submitName(event) {
    myName = $("#name").val();
    $.ajax({
        type: "POST",
        url: "addme.php",
        data: {name: myName},
        success: recKey,
    });
    event.preventDefault();
    return false;
}

function recKey(data) {
    console.log("key = " + data);
    if(data == "taken") {
        $("#message").text("That name was already taken.");
        return;
    }

    if(data == "cringe") {
        $("#message").text("That name is cringe.");
        return;
    }

    key = data;
    state = States.waiting;

    console.log($("#sideinfo"));
    $("#sideinfo").empty();
    $("#sideinfo").append("<h2>" + myName + "</h2><hr><h3>Waiting in queue:</h3><div class='queue' id='queue'></div>");
    $("#message").empty();

    makeQueue();
    if(interval == undefined) interval = setInterval(update, 3500);
}

function changeTurnIndicator(turn) {
    if(turn) $("#turn").removeClass("right");
    else $("#turn").addClass("right");
}

function gameMessage(message, stay = false) {
    $("#gameMessage").html(message);
    if(stay == false) setTimeout(() => {
        $("#gameMessage").empty();
    }, 2000);
}

function badKey() {
    console.log("Nah if you're seeing this you were probably trying to hack into the mainframe weren't you? Silly little goose");
    alert("Your connection timed out. You have been kicked out of the queue/game. I'm sorry :(");
    location.reload();
}

function changeColor(x, y, color) {
    if(colors[color] == undefined) console.log(color, " is not a color I know sadly");
    $("#c"+ x +" :nth-child("+ (y + 1) +")").css("background-color", colors[color]);
}
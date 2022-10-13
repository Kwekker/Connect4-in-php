const colors = ["#777", "red", "yellow", "#0f0"];
const messages = ["Stervus Minervus", "gg", "oh..", "cringe", "😳", "nice", "oh ok thanks I guess"];
let myName;
let opponent;
let youFirst; //If you had the first turn or not. This decides your color and when you can drop pieces.
let turn;     //The turn the game is on. Literally the second value in data.txt
let key;
let addButtons = false;

let debugThing;
let board;
let interval;

const State = {
    start: 0,
    waiting: 1,
    playing: 2,
    done: 3
}
let state = 0;

addEventListener('beforeunload', (event) => {
    $.ajax({
        type: "POST",
        url: "update.php",
        data: {leave: 1, name: myName, key: key}
    });
});

if(localStorage.name != undefined) {
    if(localStorage.instaJoin == true) {
        console.log("instaJoining");
        submitName(localStorage.name);
        localStorage.instaJoin = false;
    }
    else {
        $("#name").val(localStorage.name);
        $("#name").focus();
        $("#name").select();
    }

}

function update() {
    if(state == State.waiting) {
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
        if(str.charAt(0) == 'l') {
            if(localStorage.hasSeenDumbResetButtonJoke != true) {
                gameMessage("Your opponent left the game lol.<br>Reload the page to re-enter the queue.<h6>I'm not going to be the one to implement a restart button lol</h6>", true);
                setTimeout(() => {
                    gameMessage("<h5>Ok ok ok please stop crying here is a reset button:</h5> <br><button class='button' onclick='reset()'>Re-enter queue</button>", true); 
                }, 7);
                localStorage.hasSeenDumbResetButtonJoke = true;
            }
            else gameMessage("<button class='button' onclick='reset()'>Re-enter queue</button>", true);


            return;
        }
        else if(str.charAt(0) == 'w') {
            win();
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
    if(state == State.playing && youFirst == turn) {
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
                    if(str.startsWith("win")) win();
                    else {
                        turn = !turn;
                        changeTurnIndicator(turn);
                    }
                    str = str.substring(3);
                    changeColor(col, str.substring(1) & 0xf, !(str.charAt(0) & 0xf) + 1);
                }
                else gameMessage("php error apparently. Tell Jochem he's bad at coding");
            }
        });
    }
    else if(state == State.start) gameMessage("You have to submit your name first :/");
    else if(state == State.waiting) gameMessage("You are still waiting in the queue..");
    else if(youFirst != turn && state != State.done) gameMessage("Your opponent is still contemplating their next move.");
}

function win() {
    clearInterval(interval);
    $.get("data/wininfo.txt", function(data) {
        let arr = data + "";
        arr = arr.split(',');
        let winner = arr[0];
        let mes = "";

        if(winner === myName)
            mes += "<span class='win'>YOU WON! WOOOO</span>";
        else 
            mes += "<span class='lose'>YOU LOST! L</span>";

        //Leave me alone
        mes += "<br><br><button onclick='reset()'>Re-enter queue</button>";
        gameMessage(mes, true);

        for(let i = 1; i < arr.length; i++) {
            const index = parseInt(arr[i]);
            if(isFinite(index)) {
                changeColor(index % 7, Math.floor(index / 7), 3);
            }
        }

        state = State.done;
    });
}

function makeQueue() {
    let queue = $("#queue");
    queue.empty();
    $.get("data/queue.txt?r=" + Math.random(), function(text) {
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
    turn = true;
    state = State.playing;
    let sideInfo = $("#sideinfo");
    sideInfo.empty();
    sideInfo.append("<h2>" + myName + "</h2><hr><h3>Playing against " + opponent + "</h3><div class='queue' id='queue'></div>");
    if(yourTurn) setNames(myName, opponent);
    else setNames(opponent, myName);
}

function submitName(event) {
    if (typeof event === 'string' || event instanceof String) {
        myName = event;
    }
    else {
        myName = $("#name").val();
        localStorage.name = myName;
        event.preventDefault();
    }

    $.ajax({
        type: "POST",
        url: "addme.php",
        data: {name: myName},
        success: recKey,
    });
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
    state = State.waiting;

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

function bubbleMessage(message, side) {
    $("#bubble" + side).removeClass("bubble-gone").text(messages[message]);
    if(messages[message].length < 3) $("#bubble" + side).css("font-size", "xx-large");

    setTimeout(function() {
        $("#bubble" + side).css({"font-size" : ""}).addClass("bubble-gone");
    }, 3000);
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

function reset() {
    localStorage.instaJoin = 1;
    location.reload();
}

function changeColor(x, y, color) {
    if(colors[color] == undefined) {
        console.log(color, " is not a color I know sadly");
        return;
    }
    if(x >= 0 && x < 7 && y >= 0 && y < 6) {
        $("#c"+ x +" :nth-child("+ (y + 1) +")").css("background-color", colors[color]);
    }
    else console.log("cringe coordinates: ", "x = ", x, "y = ", y);
}
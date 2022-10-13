<?php
    require "lib.php";

    if(isset($_POST['test'])) {
        echo databaseRead("board.txt", "papa", 3);
    }

    if(isset($_POST['can']) && isset($_POST['name'])) {        
        $name = $_POST['name'];
        $can = canChoose($name);

        if($can[0]) {
            answerCan(1, $can[1]);
        }
        else if(isPlayer($name)) {
            $opponent = databaseRead("players.txt", "0");
            echo "$opponent";
        }
        else {
            answerCan(0, $can[1]);
        }
    }

    if(isset($_POST['oppo'])) {
        $opponent = $_POST['oppo'];
        $name = $_POST['name'];

        if(!authenticate($name, $_POST['key'])) {
            echo "badkey";
            die;
        }

        if(!canChoose($name)) {
            echo "cantchoose";
            die;
        }

        //Remove these players from queue.txt and add them to players.txt
        databaseInsert("players.txt", "0", $name);
        databaseInsert("players.txt", "1", $opponent);
        file_put_contents("data.txt", "11$opponent", LOCK_EX);
        databaseRemove("queue.txt", $name);
        databaseRemove("queue.txt", $opponent);
        file_put_contents("taunts.txt", "\n0 0:\n1 0:", LOCK_EX);

        //Start the game by resetting the board
        //Pretty sure this is the best way of doing this (it's 7 * 6 = 42 0's)
        $board = "000000000000000000000000000000000000000000";
        file_put_contents("board.txt", $board, LOCK_EX);

        echo "yes";
    }

    function answerCan($canChoose, $playing) {
        if($playing) {
            $players = databaseRead("players.txt", "0") . "," . databaseRead("players.txt", "1");
            echo "$canChoose"."1$players";
        }
        else echo "$canChoose"."0";
    }

    function canChoose($name) {
        $playing = (file_get_contents("data.txt")[0] == '1');
        return array((substr(file_get_contents("queue.txt"), 0, (strlen($name) + 1)) == "\n$name") && !$playing, $playing);
    }

?>

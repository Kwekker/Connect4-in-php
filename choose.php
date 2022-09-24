<?php
    require "lib.php";

    if(isset($_POST['test'])) {
        echo databaseRead("board.dat", "papa", 3);
    }

    if(isset($_POST['can']) && isset($_POST['name'])) {        
        $name = $_POST['name'];
        if(canChoose($name)) {
            echo "1";
        }
        else if(isPlayer($name)) {
            $opponent = databaseRead("players.txt", "0");
            echo "$opponent";
        }
        else echo "0";
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
        file_put_contents("data.txt", "11$name", LOCK_EX);
        databaseRemove("queue.txt", $name);
        databaseRemove("queue.txt", $opponent);

        //Start the game by resetting the board
        //Pretty sure this is the best way of doing this (it's 7 * 6 = 42 0's)
        $board = "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";
        file_put_contents("board.dat", $board, LOCK_EX);

        echo "yes";
    }

    function canChoose($name) {
        return (substr(file_get_contents("queue.txt"), 0, (strlen($name) + 1)) == "\n$name") && (file_get_contents("data.txt")[0] == '0');
    }

?>

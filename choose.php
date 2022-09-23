<?php
    require "lib.php";

    if(isset($_POST['test'])) {
        echo databaseRead("board.txt", "papa", 3);
    }

    if(isset($_POST['can']) && isset($_POST['name'])) {        
        $name = $_POST['name'];
        if(canChoose($name)) {
            echo "1";
        }
        else if(databaseContains("players.txt", $name)) {
            $file = file_get_contents("players.txt");
            $opponent = substr($file, 1, strpos($file, " ", 3));
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

        databaseInsert("players.txt", $name, "0");
        databaseInsert("players.txt", $opponent, "1");
        file_put_contents("data.txt", "10null", LOCK_EX);
        databaseRemove("queue.txt", $name);
        databaseRemove("queue.txt", $opponent);
        echo "yes";
    }

    function canChoose($name) {
        return substr(file_get_contents("queue.txt"), 0, strlen($name) + 1) == "\n$name" && file_get_contents("data.txt")[0] == '0';
    }

?>

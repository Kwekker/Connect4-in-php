<?php
    require "lib.php";

    if(isset($_POST['name']) && isset($_POST['key'])) {
        $name = $_POST['name'];

        if(!authenticate($name, $_POST['key'])) {
            echo "badkey";
            die;
        }        
        
        $timeNow = time();
        if(isset($_POST['leave'])) {
            if(isPlayer($name)) {
                stopGame();
                removeFromAll($name, true);
            }
            removeFromAll($name);
        }
        else databaseEdit("times.txt", $name, $timeNow);

        if($timeNow - intval(file_get_contents("lastcheck.txt")) > 10) {
            $player0 = databaseRead("players.txt", "0");
            $player1 = databaseRead("players.txt", "1");

            file_put_contents("lastcheck.txt", $timeNow, LOCK_EX);
            $file = file_get_contents("times.txt");
            $timedOut = array();
            $index = 0;

            $tok = strtok($file, ":");
            while($tok !== false) {
                $timeThen = intval(substr($tok, strpos($tok, " ") + 1));
                if($timeNow - $timeThen > 10) {
                    $timedOut[$index++] = substr($tok, 1, strpos($tok, " ") - 1);
                }
                $tok = strtok(":");
            } 
            
            foreach ($timedOut as $name) {
                if($name === $player0 || $name === $player1) {
                    stopGame();
                    removeFromAll($name, true);
                }
                else {
                    removeFromAll($name);
                }
            }
        }
    }

    function removeFromAll($name, $playing = false) {
        databaseRemove("keys.txt", $name);
        databaseRemove("times.txt", $name);
        if(!$playing) {
            echo "Literally removing $name from queue.txt right fucking now.\n";
            databaseRemove("queue.txt", $name);
        }
    }

    function stopGame() {
        file_put_contents("data.txt", "000", LOCK_EX);
        file_put_contents("players.txt", "", LOCK_EX);
    }

?>
<?php
    require "lib.php";

    if(isset($_POST['name']) && isset($_POST['key'])) {
        if(!authenticate($_POST['name'], $_POST['key'])) {
            echo "badkey";
            die;
        }

        $poepie = "Kleine kat hihi";
        

        $timeNow = time();
        databaseEdit("times.txt", $_POST['name'], $timeNow);

        if($timeNow - intval(file_get_contents("lastcheck.txt")) > 10) {
            file_put_contents("lastcheck.txt", $timeNow, LOCK_EX);
            $file = file_get_contents("times.txt");
            $timedOut = array();
            $index = 0;

            $tok = strtok($file, ":");
            while($tok !== false) {
                $timeThen = intval(substr($tok, strpos($tok, " ") + 1));
                if($timeNow - $timeThen > 20) {
                    $timedOut[$index++] = substr($tok, 1, strpos($tok, " ") - 1);
                }
                $tok = strtok(":");
            } 
            
            foreach ($timedOut as $name) {
                databaseRemove("keys.txt", $name);
                databaseRemove("queue.txt", $name);
                databaseRemove("times.txt", $name);
            }
        }
    }

?>
<?php

    require "lib.php";

    if(isset($_POST['taunt']) && isset($_POST['name']) && isset($_POST['key'])) {
        if(!authenticate($_POST['name'], $_POST['key'])) {
            echo "badkey";
            die;
        }

        $index = 1;
        if(databaseRead("players.txt", "0") == $_POST['name'])
            $index = 0;
        databaseEdit("taunts.txt", $index, $_POST['taunt']);

        echo "yes";
    }

?>
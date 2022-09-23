<?php
    require "lib.php";

    if(isset($_POST["col"]) && isset($_POST["name"]) && isset($_POST["key"])) {

        if(!authenticate($_POST["name"], $_POST["key"])) {
            echo "badkey";
            die;
        }

        $file = file_get_contents("board.txt");
        for($i = 0; $i < 6; $i++) {
            ;
        }
    }

?>
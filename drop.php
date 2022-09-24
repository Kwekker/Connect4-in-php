<?php
    require "lib.php";
    

    if(true || isset($_POST["col"]) && isset($_POST["name"]) && isset($_POST["key"])) {
        $col = intval($_POST["col"]);
        $name = $_POST["name"];

        if(!authenticate($_POST["name"], $_POST["key"])) {
            echo "badkey";
            die;
        }

        $data = file_get_contents("data.txt");
        if(substr($data, 2) == $name) {
            echo "badturn";
            die;
        }

        $file = file_get_contents("board.dat");

        //If you need defines for the width and height of a connect 4 board 
        //because that isn't obvious to you, then you're not worthy of this code.
        //Also defines are colored plain white in vsc and I hate plain white text in my code :)
        $row = 5;
        for(; $row >= 0; $row--) {
            $fileIndex = $row * 7 + $col;
            if($file[$fileIndex] == 0) {
                $file[$fileIndex] = 1 + $data[1];
                break;
            }
        }
        if($row < 0) {
            echo "fullcol";
            die;
        }

        $turn = (($data[1] == '0') ? '1' : '0');
        $newData = "1" . $turn . $name;

        file_put_contents("board.dat", $file, LOCK_EX);
        file_put_contents("data.txt", $newData, LOCK_EX);
        echo $turn . $row;
    }
    else echo "not enough POST things hehe:\n";

?>

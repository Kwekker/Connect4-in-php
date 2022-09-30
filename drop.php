<?php
    require "lib.php";
    

    if(true || isset($_POST["col"]) && isset($_POST["name"]) && isset($_POST["key"])) {
        $col = intval($_POST["col"]);

        if($col < 0 || $col > 6) { 
            echo "bruh what are you even trying to accomplish here nerd";
            die;
        }

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
        $fileIndex = 0;
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

        /*  Check for Wim
        *1  Check these first.
                d0
               321
        *   Count them in an array.

        *2  Check in the opposite direction if you haven't already found 4.
        */

        
        $dirs = array(1, 8, 7, 6);
        $counts = array(0, 0, 0, 0);
        $val = $file[$fileIndex];
        $win = false;

        for($sign = 1; $sign >= -1; $sign -= 2) {
            for($dir = 0; $dir < 4; $dir++) {
                for($dist = 1; $dist < 4; $dist++) {
                    $checkIndex = $fileIndex + $dirs[$dir] * $dist * $sign;
                    if(
                        $checkIndex < 42 && $checkIndex > 0
                        &&  ($dirs[$dir] <= 7 || $fileIndex % 7 < (7 - $dist))
                        &&  ($dirs[$dir] >= 7 || $fileIndex % 7 > $dist)
                        &&  $file[$checkIndex] == $val
                    ) {
                        $counts[$dir]++;
                    }
                    else break;
                }
                if($counts[$dir] >= 4) {
                    $win = true;
                    break;
                }
            }
        }
        

        $turn = (($data[1] == '0') ? '1' : '0');
        $newData = "1" . $turn . $name;

        file_put_contents("board.dat", $file, LOCK_EX);
        file_put_contents("data.txt", $newData, LOCK_EX);
        if($win) echo "win" . $turn . $row;
        else echo "yes" . $turn . $row;
    }
    else echo "not enough POST things hehe:\n";

?>

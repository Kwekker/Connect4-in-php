<?php
    require "lib.php";
    

    if(isset($_POST["col"]) && isset($_POST["name"]) && isset($_POST["key"])) {
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

        $file = file_get_contents("board.txt");

        //If you need defines for the width and height of a connect 4 board 
        //because that isn't obvious to you, then you're not worthy of this code.
        //Also defines are colored plain white in vsc and I hate plain white text in my code :)
        $row = 5;
        $fileIndex = 0;
        for(; $row >= 0; $row--) {
            $fileIndex = $row * 7 + $col;
            if($file[$fileIndex] == '0') {
                $file[$fileIndex] = 1 + $data[1];
                break;
            }
        }
        if($row < 0) {
            echo "fullcol";
            die;
        }

        /*  Check for Wim
        *1  Check these directions in this order.
                d0
               321
        *2  Check in the opposite direction if you haven't already found 4.
        *3  Repeat with next direction if you haven't already found 4.


        */

        
        $dirs = array(1, 8, 7, 6);
        $winningPieces = "";
        $val = $file[$fileIndex];
        $startX = $fileIndex % 7;
        $win = false;

        for($dir = 0; $dir < 4; $dir++) {
            $count = 0;
            for($sign = 1; $sign >= -1; $sign -= 2) {
                for($dist = 1; $dist < 4; $dist++) {
                    $checkIndex = $fileIndex + $dirs[$dir] * $dist * $sign;
                    //bro just use x and y coordinates you nerd
                    //Don't make this shit harder for yourself this code runs like once every minute.
                    //Shit doesn't have to run on an attiny
                    
                    $checkX = $checkIndex % 7;
                    if (                                                        //Continue if:
                        $checkIndex < 42 && $checkIndex > 0                     //It isn't horribly out of bounds
                        &&  !(($checkX > $startX == ($sign == 1)) && $dir == 3) //It doesn't loop around on the left
                        &&  !(($checkX < $startX == ($sign == 1)) && $dir <= 1) //It doesn't loop around on the right
                        &&  $file[$checkIndex] == $val                          //It has the same value
                    ) {
                        $count++;
                        $winningPieces .= "$checkIndex,";
                    }
                    else {
                        break;
                    }
                }
            }
            if($count >= 3) {
                $win = true;
                $dir = 69;
                break;
            }
            $winningPieces = "";
        }

        $turn = (($data[1] == '0') ? '1' : '0');
        $newData = "1" . $turn . $name;

        file_put_contents("board.txt", $file, LOCK_EX);
        file_put_contents("data.txt", $newData, LOCK_EX);
        if($win) {
            echo "win" . $turn . $row;
            file_put_contents("wininfo.txt", "$name,$fileIndex,$winningPieces", LOCK_EX);
            file_put_contents("data.txt", "w00", LOCK_EX);
        }
        else echo "yes" . $turn . $row;
    }
    else echo "not enough POST things hehe:\n";

?>

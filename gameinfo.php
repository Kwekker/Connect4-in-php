<?php

    require "lib.php";
    $data = substr(file_get_contents("../data/data.txt"), 0, 2);

    // This is horrible and I hate it but this is how I did it back then.
    if($data[0] == '1') echo $data . file_get_contents("../data/board.txt") . file_get_contents("taunts.txt");
    else echo $data;

?>
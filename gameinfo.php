<?php

    require "lib.php";
    $data = substr(file_get_contents("../data/data.txt"), 0, 2);

    if($data[0] == '1') echo $data . file_get_contents("../data/board.dat");
    else echo $data;

?>
<?php
    require "lib.php";

    if(isset($_POST['name'])) {
        $name = $_POST['name'];

        if(!ctype_alnum($name) || strlen($name) < 3 || strlen($name) > 12) {
            echo "cringe";
            die;
        }

        if(databaseContains("keys.txt", $name)) {
            echo "taken";
            die;
        }

        $key = getRandomHex(8);
        databaseInsert("queue.txt", $name, "");
        databaseInsert("keys.txt", $name, $key);
        databaseInsert("times.txt", $name, time());
        echo $key;
    }

    function getRandomHex($num_bytes=4) {
        return bin2hex(openssl_random_pseudo_bytes($num_bytes));
    }
?>
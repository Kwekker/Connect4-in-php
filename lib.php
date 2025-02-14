<?php
    chdir("data");

    function authenticate($name, $key) {
        return databaseRead("keys.txt", $name) === $key;
    }


    function databaseInsert($fileName, $name, $value) {
        $append = "\n$name $value:";

        file_put_contents($fileName, $append, FILE_APPEND);
    }

    function databaseContains($fileName, $name) {
        $file = file_get_contents($fileName);

        return strpos($file, "\n".$name." ") !== false;
    }

    function databaseRead($fileName, $name) {
        $file = file_get_contents($fileName);

        $startPos = strpos($file, "\n" . $name . " ");
        if($startPos === false) return false;
        $startPos += strlen($name) + 2;
        $endPos = strpos($file, ":", $startPos + 1);

        return substr($file, $startPos, $endPos - $startPos);
    }

    function databaseRemove($fileName, $name) {
        $file = file_get_contents($fileName);
        $newFile = $file;

        $startPos = strpos($file, "\n$name ");
        if($startPos === false) return false;

        $endPos = strpos($file, ":", $startPos + 1) + 1;
        if($endPos === false) return false;

        $newFile = substr_replace($file, "", $startPos, $endPos - $startPos);
        file_put_contents($fileName, $newFile, LOCK_EX);
    }

    function databaseEdit($fileName, $name, $value) {
        $file = file_get_contents($fileName);
        $newFile = "";

        $startPos = strpos($file, "\n" . $name . " ");
        if($startPos === false) return false;
        $startPos = strpos($file, " ", $startPos) + 1;
        $endPos = strpos($file, ":", $startPos);

        $newFile = substr_replace($file, $value, $startPos, $endPos - $startPos);
        if($newFile !== false) file_put_contents($fileName, $newFile, LOCK_EX);
        return true;
    }

    function isPlayer(string $name) {
        return databaseRead("players.txt", '0') == $name || databaseRead("players.txt", '1') == $name;
    }
?>
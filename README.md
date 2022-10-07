# Connect4-php
This is a personal challenge to create connect 4 purely with javascript and php. I know it's inefficient and ugly but I really like the challenge. 

All state is stored in files and player authentication is done using randomly generated hex keys, which isn't very secure.
I don't really care about the game's security though, because it would be kinda funny if someone hacked into a match.

Features:
* Only one game can be played at the time.
* Users who are not currently playing wait in a queue.
* When the current game is done the first person in line gets to choose who to play against.
* I might add a feature that makes it so that said person has a time limit to choose to prevent someone from making the game unplayable.
* Users authenticate themselves using a hex key. These keys are stored in the file keys.txt (which will obviously be unavailable to users).


Sprout Detective #TITLE

-> init

=== init
+ [auto: start game]
    -> front_desk

=== front_desk

-(opts)

+[tag: reception_talk]
    ->talk_to_receptionist->

+ [tag: exit-east]
    You cannot leave east yet
+ [tag: exit-west]
    You cannot leave west yet

-
-> opts

=== talk_to_receptionist
Welcome to Lich Hotel.
Do you have a room here ?
+ yes
+ no
-
Then why bother me ?
->->


=== other_knot
Day 2 #TITLE
This is another knot

-> DONE

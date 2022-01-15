=== reception

-(opts)

+[tag: reception_talk]
    ->talk_to_receptionist->
+[tag: reception-to-corridor1]
    SPAWN_AT(corridor1-from-reception)
    ->corridor1
+[tag: access-behind-desk]
    This is for staff only, go back ! #receptionist-angry
    SPAWN_AT(behind-desk-pushback)
+ [tag: cat]
    I'm a cat. But not just any cat. I'm the cat of the \#\#[REDACTED]\#\#. And I have an eye patch! #cat-patch
-
-> opts

=== talk_to_receptionist
Welcome to Lich Hotel. #receptionist-bored
Do you have a room here ? #receptionist-bored
+ Yes
+ No
-
So why bother me ?

->->


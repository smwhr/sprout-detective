=== reception

-(opts)

+[tag: reception_talk]
    ->talk_to_receptionist->
+[tag: reception-to-corridor1]
    SPAWN_AT(corridor1-from-reception)
    ->corridor1
+[tag: access-behind-desk]
    Receptionnist: This is for staff only, go back !
    SPAWN_AT(behind-desk-pushback)

-
-> opts

=== talk_to_receptionist
Welcome to Lich Hotel.
->->


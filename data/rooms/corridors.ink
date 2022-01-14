=== corridor1

<-elevator_thread
+ [tag: corridor1-to-reception]
    SPAWN_AT(reception-from-corridor1)
    ->reception
->DONE

=== corridor2

<-elevator_thread
->DONE

=== corridor3

<-elevator_thread
->DONE
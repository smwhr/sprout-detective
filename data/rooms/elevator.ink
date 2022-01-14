VAR currentFloor = 1


=== elevator_thread
+[tag: elevator]
    SPAWN_AT(elevator-in)
    -> elevator
-> DONE

=== elevator
{You are in the elevator|}

-(opts)
+ [tag: elevator-1]
    ~ moveElevator(1)
    -> opts
+ [tag: elevator-2]
    ~ moveElevator(2)
    -> opts
+ [tag: elevator-3]
    ~ moveElevator(3)
    -> opts
+ [tag: elevator-4]
    ~ moveElevator(4)
    -> opts
+ [tag: elevator-exit]
    {currentFloor:
        - 1 :
            SPAWN_AT(elevator-1)
            -> corridor1
        - 2 : 
            SPAWN_AT(elevator-2)
            -> corridor2
        - 3 : 
            SPAWN_AT(elevator-3)
            -> corridor3
        - 4 : 
            SPAWN_AT(elevator-4)
            -> swimming_pool
    }


=== function moveElevator(to)
{to == currentFloor:
    - You already are on Floor {to}
    - else: 
        You feel the elevator moving {to > currentFloor: up|down}
        ~ currentFloor = to
}


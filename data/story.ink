INCLUDE rooms/elevator.ink
INCLUDE rooms/corridors.ink
INCLUDE rooms/swimmingpool.ink
INCLUDE rooms/reception.ink



Sprout Detective #TITLE

-> init

=== init
+ [auto: start game]
    SPAWN_AT(desk-from-start)
    -> reception


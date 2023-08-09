# dead-simple-edd

This project contains 2 services written in `typescript` and `golang`.
Golang project is a "frontend" with REST API endpoints for producting a message to rabbitmq.
Consumer aka "backend" in this project written in typescript with nodejs as a runtime
Backend creates a record in database when it receives a message from queue.

### Sequence diagram

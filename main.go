package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func publishMessage(message []byte, brokerHost string) {
	conn, err := amqp.Dial(brokerHost)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer func(conn *amqp.Connection) {
		err := conn.Close()
		if err != nil {
			log.Panic(err)
		}
	}(conn)

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer func(ch *amqp.Channel) {
		err := ch.Close()
		if err != nil {
			log.Panic(err)
		}
	}(ch)

	q, err := ch.QueueDeclare(
		"messages", // name
		false,      // durable
		false,      // delete when unused
		false,      // exclusive
		false,      // no-wait
		nil,        // arguments
	)
	failOnError(err, "Failed to declare a queue")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = ch.PublishWithContext(ctx,
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        message,
		})
	failOnError(err, "Failed to publish a message")
	log.Printf(" [x] Sent %s\n", message)
}

func getBrokerHost() string {
	brokerHost, ok := os.LookupEnv("BROKER_HOST")
	if !ok {
		brokerHost = "amqp://guest:guest@localhost:5672/"
	}
	return brokerHost
}

func main() {
	app := fiber.New()
	app.Use(logger.New())
	brokerHost := getBrokerHost()

	app.Post("/message", func(c *fiber.Ctx) error {
		publishMessage(c.Body(), brokerHost)
		return c.SendString("ok")
	})

	log.Fatal(app.Listen(":3000"))
}

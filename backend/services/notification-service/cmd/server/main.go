package main

import (
	"log"
	"net/http"
	"os"

	httpAdapter "github.com/tokobapak/notification-service/internal/adapter/http"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3009"
	}
	log.Printf("notification-service listening on :%s", port)
	if err := http.ListenAndServe(":"+port, httpAdapter.NewRouter()); err != nil {
		log.Fatal(err)
	}
}

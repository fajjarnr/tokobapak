package main

import (
	"log"
	"net/http"
	"os"

	httpAdapter "github.com/tokobapak/user-service/internal/adapter/http"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3006"
	}
	log.Printf("user-service listening on :%s", port)
	if err := http.ListenAndServe(":"+port, httpAdapter.NewRouter()); err != nil {
		log.Fatal(err)
	}
}

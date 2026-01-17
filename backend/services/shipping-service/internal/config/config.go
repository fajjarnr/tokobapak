package config

import (
	"os"
)

type Config struct {
	Port         string
	DatabaseURL  string
	KafkaBrokers string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "3008"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/tokobapak_shipping?sslmode=disable"),
		KafkaBrokers: getEnv("KAFKA_BROKERS", "localhost:9092"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

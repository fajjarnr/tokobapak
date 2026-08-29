package config

import "os"

type Config struct {
	Port         string
	DBHost       string
	DBPort       string
	DBUser       string
	DBPassword   string
	DBName       string
	RedisHost    string
	RedisPort    string
	KafkaBrokers string
	JWTSecret    string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "3010"),
		DBHost:       getEnv("DB_HOST", "postgres"),
		DBPort:       getEnv("DB_PORT", "5432"),
		DBUser:       getEnv("DB_USER", "postgres"),
		DBPassword:   getEnv("DB_PASSWORD", "postgres"),
		DBName:       getEnv("DB_NAME", "tokobapak"),
		RedisHost:    getEnv("REDIS_HOST", "redis"),
		RedisPort:    getEnv("REDIS_PORT", "6379"),
		KafkaBrokers: getEnv("KAFKA_BROKERS", "kafka:29092"),
		JWTSecret:    getEnv("JWT_SECRET", "tokobapak-dev-secret"),
	}
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

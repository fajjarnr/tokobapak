package config

import "os"

type Config struct {
	Port           string
	StoragePath    string
	MaxUploadSize  int64
	AllowedFormats []string
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "3015"),
		StoragePath:    getEnv("STORAGE_PATH", "./uploads"),
		MaxUploadSize:  10 * 1024 * 1024, // 10MB
		AllowedFormats: []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm"},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

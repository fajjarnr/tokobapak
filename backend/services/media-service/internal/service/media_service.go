package service

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/tokobapak/media-service/internal/config"
	"github.com/tokobapak/media-service/internal/domain"
)

type MediaService struct {
	cfg     *config.Config
	baseURL string
}

func NewMediaService(cfg *config.Config) *MediaService {
	// Create storage directory
	os.MkdirAll(cfg.StoragePath, 0755)
	
	return &MediaService{
		cfg:     cfg,
		baseURL: fmt.Sprintf("http://localhost:%s/media", cfg.Port),
	}
}

func (s *MediaService) Upload(file multipart.File, header *multipart.FileHeader, ownerID, ownerType string) (*domain.UploadResponse, error) {
	// Validate file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !s.isAllowedFormat(ext) {
		return nil, fmt.Errorf("unsupported file format: %s", ext)
	}

	// Validate file size
	if header.Size > s.cfg.MaxUploadSize {
		return nil, fmt.Errorf("file too large: max %d bytes", s.cfg.MaxUploadSize)
	}

	// Generate unique filename
	id := uuid.New()
	filename := fmt.Sprintf("%s%s", id.String(), ext)
	filepath := filepath.Join(s.cfg.StoragePath, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// Determine media type
	mediaType := domain.TypeImage
	if strings.HasPrefix(header.Header.Get("Content-Type"), "video/") {
		mediaType = domain.TypeVideo
	}

	return &domain.UploadResponse{
		ID:       id,
		URL:      fmt.Sprintf("%s/%s", s.baseURL, filename),
		FileName: filename,
		MimeType: header.Header.Get("Content-Type"),
		Size:     header.Size,
	}, nil
}

func (s *MediaService) GetFilePath(filename string) string {
	return filepath.Join(s.cfg.StoragePath, filename)
}

func (s *MediaService) Delete(filename string) error {
	filepath := s.GetFilePath(filename)
	return os.Remove(filepath)
}

func (s *MediaService) isAllowedFormat(ext string) bool {
	for _, allowed := range s.cfg.AllowedFormats {
		if ext == allowed {
			return true
		}
	}
	return false
}

func (s *MediaService) ListFiles(ownerID string) ([]domain.Media, error) {
	// For now, list all files in storage
	var files []domain.Media
	
	entries, err := os.ReadDir(s.cfg.StoragePath)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		
		info, _ := entry.Info()
		files = append(files, domain.Media{
			FileName:  entry.Name(),
			URL:       fmt.Sprintf("%s/%s", s.baseURL, entry.Name()),
			Size:      info.Size(),
			CreatedAt: info.ModTime(),
		})
	}

	return files, nil
}

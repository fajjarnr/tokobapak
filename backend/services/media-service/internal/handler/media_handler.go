package handler

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/tokobapak/media-service/internal/service"
)

type MediaHandler struct {
	service *service.MediaService
}

func NewMediaHandler(svc *service.MediaService) *MediaHandler {
	return &MediaHandler{service: svc}
}

func (h *MediaHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/media", func(r chi.Router) {
		r.Post("/upload", h.Upload)
		r.Get("/", h.ListFiles)
		r.Delete("/{filename}", h.Delete)
	})
	
	// Serve static files
	r.Get("/media/{filename}", h.ServeFile)
}

func (h *MediaHandler) Upload(w http.ResponseWriter, r *http.Request) {
	// Max 10MB file
	r.ParseMultipartForm(10 << 20)
	
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to read file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	ownerID := r.FormValue("ownerId")
	ownerType := r.FormValue("ownerType")

	response, err := h.service.Upload(file, header, ownerID, ownerType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *MediaHandler) ServeFile(w http.ResponseWriter, r *http.Request) {
	filename := chi.URLParam(r, "filename")
	filepath := h.service.GetFilePath(filename)

	// Check if file exists
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, filepath)
}

func (h *MediaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	filename := chi.URLParam(r, "filename")
	
	if err := h.service.Delete(filename); err != nil {
		http.Error(w, "Failed to delete file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MediaHandler) ListFiles(w http.ResponseWriter, r *http.Request) {
	ownerID := r.URL.Query().Get("ownerId")
	
	files, err := h.service.ListFiles(ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

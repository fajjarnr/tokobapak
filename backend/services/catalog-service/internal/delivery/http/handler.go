package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/tokobapak/catalog-service/internal/domain"
)

type CategoryHandler struct {
	CUsecase domain.CategoryUsecase
}

func NewCategoryHandler(r *chi.Mux, us domain.CategoryUsecase) {
	handler := &CategoryHandler{
		CUsecase: us,
	}

	r.Route("/api/v1/categories", func(r chi.Router) {
		r.Get("/", handler.Fetch)
		r.Get("/{id}", handler.GetByID)
		r.Post("/", handler.Store)
		r.Put("/{id}", handler.Update)
		r.Delete("/{id}", handler.Delete)
	})
}

func (a *CategoryHandler) Fetch(w http.ResponseWriter, r *http.Request) {
	cursor := r.URL.Query().Get("cursor")
	numS := r.URL.Query().Get("num")
	num, _ := strconv.ParseInt(numS, 10, 64)

	list, nextCursor, err := a.CUsecase.Fetch(r.Context(), cursor, num)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"data":       list,
		"nextCursor": nextCursor,
	})
}

func (a *CategoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := r.Context()

	cat, err := a.CUsecase.GetByID(ctx, id)
	if err != nil {
		respondError(w, http.StatusNotFound, domain.ErrNotFound.Error())
		return
	}

	respondJSON(w, http.StatusOK, cat)
}

func (a *CategoryHandler) Store(w http.ResponseWriter, r *http.Request) {
	var category domain.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := a.CUsecase.Store(r.Context(), &category); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, category)
}

func (a *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var category domain.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	
	category.ID = id
	if err := a.CUsecase.Update(r.Context(), &category); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, category)
}

func (a *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	if err := a.CUsecase.Delete(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(response)
}

func respondError(w http.ResponseWriter, code int, message string) {
	respondJSON(w, code, map[string]string{"error": message})
}

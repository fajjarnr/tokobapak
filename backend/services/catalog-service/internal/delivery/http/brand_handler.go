package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/tokobapak/catalog-service/internal/domain"
)

type BrandHandler struct {
	BUsecase domain.BrandUsecase
}

func NewBrandHandler(r *chi.Mux, us domain.BrandUsecase) {
	handler := &BrandHandler{
		BUsecase: us,
	}

	r.Route("/api/v1/brands", func(r chi.Router) {
		r.Get("/", handler.Fetch)
		r.Get("/{id}", handler.GetByID)
		r.Post("/", handler.Store)
		r.Put("/{id}", handler.Update)
		r.Delete("/{id}", handler.Delete)
	})
}

func (a *BrandHandler) Fetch(w http.ResponseWriter, r *http.Request) {
	cursor := r.URL.Query().Get("cursor")
	numS := r.URL.Query().Get("num")
	num, _ := strconv.ParseInt(numS, 10, 64)

	list, nextCursor, err := a.BUsecase.Fetch(r.Context(), cursor, num)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"data":       list,
		"nextCursor": nextCursor,
	})
}

func (a *BrandHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := r.Context()

	cat, err := a.BUsecase.GetByID(ctx, id)
	if err != nil {
		respondError(w, http.StatusNotFound, domain.ErrNotFound.Error())
		return
	}

	respondJSON(w, http.StatusOK, cat)
}

func (a *BrandHandler) Store(w http.ResponseWriter, r *http.Request) {
	var brand domain.Brand
	if err := json.NewDecoder(r.Body).Decode(&brand); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := a.BUsecase.Store(r.Context(), &brand); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, brand)
}

func (a *BrandHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var brand domain.Brand
	if err := json.NewDecoder(r.Body).Decode(&brand); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	
	brand.ID = id
	if err := a.BUsecase.Update(r.Context(), &brand); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, brand)
}

func (a *BrandHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	if err := a.BUsecase.Delete(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

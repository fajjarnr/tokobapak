package service

import "context"

type Service struct {}

func NewService() *Service { return &Service{} }

func (s *Service) Health(ctx context.Context) string { return "ok:notification-service" }

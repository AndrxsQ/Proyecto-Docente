package auth

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type AuthMiddleware struct {
	authService *service.AuthService
}

func NewAuthMiddleware(authService *service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{authService: authService}
}

func (m *AuthMiddleware) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		userID, rol, err := m.authService.ValidateToken(token)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		r.Header.Set("X-User-ID", strconv.Itoa(userID))
		r.Header.Set("X-User-Rol", string(rol))
		next(w, r)
	}
}

func (m *AuthMiddleware) RequireRole(roles ...models.Rol) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			userRol := models.Rol(r.Header.Get("X-User-Rol"))

			for _, role := range roles {
				if userRol == role {
					next(w, r)
					return
				}
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "insufficient permissions"})
		}
	}
}

func GetUserID(r *http.Request) int {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		return 0
	}
	id, err := strconv.Atoi(userID)
	if err != nil {
		return 0
	}
	return id
}

func GetUserRol(r *http.Request) models.Rol {
	return models.Rol(r.Header.Get("X-User-Rol"))
}

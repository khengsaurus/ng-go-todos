package middlewares

import (
	"context"
	"net/http"

	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/khengsaurus/ng-go-todos/utils"
	"github.com/rs/cors"
)

func EnableCors(h http.Handler) http.Handler {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedHeaders:   []string{"*"},
		AllowedMethods:   []string{"HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowCredentials: true,
	})

	return c.Handler(h)
}

func WithContext(key consts.ContextKey, client interface{}) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return WithContextFn(key, client, next)
	}
}

func WithContextFn(key consts.ContextKey, client interface{}, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), key, client)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func AdminValidation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !utils.ValidateAdmin(r.Header.Get("Authorization")) {
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}

package middlewares

import (
	"context"
	"net/http"

	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/rs/cors"
)

func EnableCors(h http.Handler) http.Handler {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedHeaders:   []string{"*"},
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

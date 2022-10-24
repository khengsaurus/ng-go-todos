package middlewares

import (
	"context"
	"net/http"

	"github.com/khengsaurus/ng-gql-todos/consts"
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

func AttachToContext(key consts.ContextKey, client interface{}, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqWithStore := r.WithContext(context.WithValue(r.Context(), key, client))
		next.ServeHTTP(w, reqWithStore)
	})
}

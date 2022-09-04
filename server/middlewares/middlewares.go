package middlewares

import (
	"context"
	"net/http"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
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

func WithMongoClient(mongoClient *database.MongoClient, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqWithStore := r.WithContext(context.WithValue(r.Context(), consts.MongoClientKey, mongoClient))
		next.ServeHTTP(w, reqWithStore)
	})
}

func WithRedisClient(redisClient *database.RedisClient, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqWithStore := r.WithContext(context.WithValue(r.Context(), consts.RedisClientKey, redisClient))
		next.ServeHTTP(w, reqWithStore)
	})
}

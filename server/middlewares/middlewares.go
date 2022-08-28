package middlewares

import (
	"context"
	"net/http"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
)

// Inject mongo client into context
func WithMongoClient(mongoClient *database.MongoClient, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqWithStore := r.WithContext(context.WithValue(r.Context(), consts.MongoClientKey, mongoClient))
		next.ServeHTTP(w, reqWithStore)
	})
}

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/khengsaurus/ng-gql-todos/graph"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/store"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	db := store.NewStore()

	server := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", store.WithStore(db, server))

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

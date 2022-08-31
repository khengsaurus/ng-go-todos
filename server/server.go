package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/joho/godotenv"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/middlewares"
)

const (
	defaultPort = "8080"
	api         = "/api"
	test        = "/test"
	pg          = "/playground"
)

func main() {
	envErr := godotenv.Load("local.env")
	if envErr != nil {
		panic(envErr)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	router := chi.NewRouter()
	router.Use(middlewares.EnableCors)

	mongoClient := database.InitMongoClient(true)
	server := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))

	router.HandleFunc(test, testHandler)
	router.Handle(pg, playground.Handler("GraphQL playground", api))
	router.Handle(api, middlewares.WithMongoClient(mongoClient, server))

	err := http.ListenAndServe(fmt.Sprintf(":%s", defaultPort), router)
	if err != nil {
		panic(err)
	}
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Success"))
}

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

var (
	route_api  = "/api"
	route_test = "/test"
	route_pg   = "/playground"
)

func main() {
	envErr := godotenv.Load("local.env")
	if envErr != nil {
		panic(envErr)
	}

	router := chi.NewRouter()
	router.Use(middlewares.EnableCors)

	redisClient := database.InitRedisClient()
	mongoClient := database.InitMongoClient(true)
	server := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	// middlewares.WithMongoClient(mongoClient, server)
	// middlewares.WithRedisClient(redisClient, server)
	wrappedServer := middlewares.WithRedisClient(redisClient, middlewares.WithMongoClient(mongoClient, server))

	router.HandleFunc(route_test, testHandler)
	router.Handle(route_pg, playground.Handler("GraphQL playground", route_api))
	router.Handle(route_api, wrappedServer)

	err := http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), router)
	if err != nil {
		panic(err)
	}
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Success"))
}

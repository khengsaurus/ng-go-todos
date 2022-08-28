package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/middlewares"
)

const defaultPort = "8080"

func main() {
	envErr := godotenv.Load("local.env")
	if envErr != nil {
		panic(envErr)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	mongoClient := database.InitMongoClient(true)
	mongoClient.Ping(true)

	server := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))

	http.Handle("/playground", playground.Handler("GraphQL playground", "/api"))
	http.Handle("/api", middlewares.WithMongoClient(mongoClient, server))

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

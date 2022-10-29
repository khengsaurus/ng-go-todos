package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/joho/godotenv"
	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/controllers"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/middlewares"
)

var (
	route_gql    = "/gql_api"
	route_rest   = "/rest_api"
	route_test   = "/test"
	route_gql_pg = "/playground"
)

func main() {
	envErr := godotenv.Load("local.env")
	if envErr != nil {
		panic(envErr)
	}

	router := chi.NewRouter()
	router.Use(middlewares.EnableCors)

	server := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	wrappedServer :=
		middlewares.AttachToContext(consts.MongoClientKey, database.InitMongoClient(),
			middlewares.AttachToContext(consts.RedisClientKey, database.InitRedisClient(),
				server),
		)

	router.HandleFunc(route_test, test)
	router.Route(route_rest, controllers.RestHandler)
	router.Handle(route_gql_pg, playground.Handler("GraphQL playground", route_gql))
	router.Handle(route_gql, wrappedServer)

	err := http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), router)
	if err != nil {
		panic(err)
	}
}

func test(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Success"))
}

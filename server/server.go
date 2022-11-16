package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	GQLHandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	ChiMiddleware "github.com/go-chi/chi/middleware"
	"github.com/joho/godotenv"
	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/khengsaurus/ng-go-todos/controllers"
	"github.com/khengsaurus/ng-go-todos/database"
	"github.com/khengsaurus/ng-go-todos/graph"
	"github.com/khengsaurus/ng-go-todos/graph/generated"
	"github.com/khengsaurus/ng-go-todos/middlewares"
)

var (
	route_gql    = "/gql_api"
	route_rest   = "/rest_api"
	route_test   = "/test"
	route_gql_pg = "/playground"
)

func main() {
	envErr := godotenv.Load(".env")
	if envErr != nil {
		panic(envErr)
	}

	mongoClient := database.InitMongoClient()
	s3Client := database.InitS3Client()
	redisClient := database.InitRedisClient()

	router := chi.NewRouter()
	router.Use(middlewares.EnableCors)
	router.Use(ChiMiddleware.Timeout(30 * time.Second))

	GQLHandlerInstance := GQLHandler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	wrappedGQLHandler :=
		middlewares.WithContextFn(consts.MongoClientKey, mongoClient,
			middlewares.WithContextFn(consts.RedisClientKey, redisClient,
				GQLHandlerInstance,
			),
		)

	router.Handle(route_gql, wrappedGQLHandler)
	router.Route(route_rest, func(restRouter chi.Router) {
		// Only files api requires s3Client
		restRouter.Use(middlewares.WithContext(consts.S3ClientKey, s3Client))
		controllers.RestRouter(restRouter)
	})

	// Dev
	router.HandleFunc(route_test, test)
	router.Handle(route_gql_pg, playground.Handler("GraphQL playground", route_gql))

	err := http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), router)
	if err != nil {
		panic(err)
	}
}

func test(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Success"))
}

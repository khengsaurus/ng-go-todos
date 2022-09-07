package consts

import "os"

type ContextKey string

var (
	Container       = os.Getenv("CONTAINER") == "true"
	RedisClientKey  = ContextKey("redis_client")
	MongoClientKey  = ContextKey("mongo_client")
	MongoDatabase   = "ng-gql-go"
	UsersCollection = "users"
	TodosCollection = "todos"
)

package consts

import (
	"os"
	"time"
)

type ContextKey string

var (
	Container        = os.Getenv("CONTAINER") == "true"
	RedisClientKey   = ContextKey("redis_client")
	MongoClientKey   = ContextKey("mongo_client")
	MongoDatabase    = "ng-gql-go"
	UsersCollection  = "users"
	TodosCollection  = "todos"
	BoardsCollection = "boards"
	DefaultTTL       = time.Second * 1800 // 30 mins
)

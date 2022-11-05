package consts

import (
	"os"
	"time"
)

type ContextKey string

var (
	Container        = os.Getenv("CONTAINER") == "true"
	MongoClientKey   = ContextKey("mongo_client")
	S3ClientKey      = ContextKey("s3_client")
	RedisClientKey   = ContextKey("redis_client")
	MongoDatabase    = "ng-gql-go"
	UsersCollection  = "users"
	TodosCollection  = "todos"
	BoardsCollection = "boards"
	DefaultTTL       = time.Second * 1800 // 30 mins
)

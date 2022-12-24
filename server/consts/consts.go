package consts

import (
	"os"
	"time"
)

type ContextKey string

var (
	Local            = os.Getenv("LOCAL") == "true"
	MongoClientKey   = ContextKey("mongo_client")
	S3ClientKey      = ContextKey("s3_client")
	RedisClientKey   = ContextKey("redis_client")
	RedisKeyPrefix   = "NGGT"
	RedisTTL         = time.Second * 600
	MongoDatabase    = "ng-gql-go" // do not change
	UsersCollection  = "users"
	TodosCollection  = "todos"
	BoardsCollection = "boards"
)

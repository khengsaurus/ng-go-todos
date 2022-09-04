package consts

type ContextKey string

var (
	RedisClientKey  = ContextKey("redis_client")
	MongoClientKey  = ContextKey("mongo_client")
	MongoDatabase   = "ng-gql-go"
	UsersCollection = "users"
	TodosCollection = "todos"
)

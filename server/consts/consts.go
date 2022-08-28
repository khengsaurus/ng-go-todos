package consts

type ContextKey string

var (
	MongoClientKey  = ContextKey("mongo_client")
	MongoDatabase   = "ng-gql-go"
	UsersCollection = "users"
	TodosCollection = "todos"
)

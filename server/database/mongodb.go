package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	instance *mongo.Client
}

func InitMongoClient(ping bool) *MongoClient {
	var uri string
	if consts.Container {
		fmt.Println("Mongo config: local")
		uri = os.Getenv("MONGO_SERVICE")
	} else {
		fmt.Println("Mongo config: remote")
		uri = os.Getenv("MONGODB_URI")
	}
	if uri == "" {
		log.Fatal("MongoDB URI not found.\n")
	}

	// TODO is it possible to do instance = mongo.NewClient(...) and just call instance.Connect() :/
	instance, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}
	defer instance.Disconnect(context.TODO())

	if ping {
		err = instance.Ping(context.TODO(), nil)
		if err != nil {
			fmt.Printf("MongoDB client ping failed: %v\n", err)
		} else {
			fmt.Println("MongoDB client ping success 🍀")
		}
	}

	return &MongoClient{instance: instance}
}

func (mongoClient *MongoClient) Connect(ctx context.Context) error {
	var uri string
	if consts.Container {
		uri = os.Getenv("MONGO_SERVICE")
	} else {
		uri = os.Getenv("MONGODB_URI")
	}
	if uri == "" {
		log.Fatal("MongoDB URI not found.\n")
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	mongoClient.instance = client
	return nil
}

func (mongoClient *MongoClient) Disconnect(ctx context.Context) {
	if err := mongoClient.instance.Disconnect(ctx); err != nil {
		fmt.Println("Failed to disconnect MongoDB client")
		fmt.Printf("%v\n", err)
	}
}

func (mongoClient *MongoClient) GetCollection(name string) (*mongo.Collection, error) {
	database := mongoClient.instance.Database(consts.MongoDatabase)
	if database == nil {
		return nil, fmt.Errorf("MongoDB client couldn't conenct to database %s", consts.MongoDatabase)
	}
	return database.Collection(name), nil
}

func GetMongoClient(ctx context.Context, connect bool) (*MongoClient, error) {
	mongoClient, ok := ctx.Value(consts.MongoClientKey).(*MongoClient)
	if !ok {
		return nil, fmt.Errorf("couldn't find %s in context", consts.MongoClientKey)
	}
	if connect {
		err := mongoClient.Connect(ctx)
		if err != nil {
			return mongoClient, fmt.Errorf("failed to connect MongoDB client: %v", err)
		}
	}
	return mongoClient, nil
}

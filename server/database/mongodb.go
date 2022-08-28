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

func InitMongoClient(connect bool) *MongoClient {
	client := &MongoClient{instance: nil}
	if connect {
		err := client.Connect()
		if err != nil {
			fmt.Print(err)
		}
	}
	return client
}

func (mongoClient *MongoClient) Ping(disconnect bool) {
	pingErr := mongoClient.instance.Ping(context.TODO(), nil)
	if pingErr != nil {
		fmt.Printf("Mongo client ping failed: %v\n", pingErr)
	} else {
		fmt.Println("Mongo client ping success 🍀")
	}
	if disconnect {
		mongoClient.Disconnect()
	}
}

func (mongoClient *MongoClient) Connect() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("'MONGODB_URI' environmental variable not found.\n")
	}

	client, connectErr := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if connectErr != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", connectErr)
	}

	mongoClient.instance = client
	return nil
}

func (mongoClient *MongoClient) Disconnect() {
	if err := mongoClient.instance.Disconnect(context.TODO()); err != nil {
		fmt.Println("Failed to disconnect mongo client")
	}
}

func (mongoClient *MongoClient) GetCollection(name string) (*mongo.Collection, error) {
	database := mongoClient.instance.Database(consts.MongoDatabase)
	if database == nil {
		return nil, fmt.Errorf("MongoDB client couldn't conenct to database %s", consts.MongoDatabase)
	}
	return database.Collection(name), nil
}

func GetClient(ctx context.Context, connect bool) (*MongoClient, error) {
	mongoClient, ok := ctx.Value(consts.MongoClientKey).(*MongoClient)
	if !ok {
		return nil, fmt.Errorf("couldn't find %s in context", consts.MongoClientKey)
	}
	if connect {
		err := mongoClient.Connect()
		if err != nil {
			return mongoClient, fmt.Errorf("failed to connect to MongoDB: %v", err)
		}
	}
	return mongoClient, nil
}

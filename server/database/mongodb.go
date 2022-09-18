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

	instance, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	return &MongoClient{instance: instance}
}

func (mongoClient *MongoClient) Connect(ctx context.Context) error {
	fmt.Println("MongoClient.Connect called")
	var uri string
	if consts.Container {
		uri = os.Getenv("MONGO_SERVICE")
	} else {
		uri = os.Getenv("MONGODB_URI")
	}
	if uri == "" {
		log.Fatal("MongoDB URI not found.\n")
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return fmt.Errorf("MongoClient.Connect failed: %v", err)
	}

	mongoClient.instance = client
	return nil
}

func (mongoClient *MongoClient) Ping(ctx context.Context) {
	err := mongoClient.instance.Ping(ctx, nil)
	if err != nil {
		fmt.Printf("MongoClient.Ping failed: %v\n", err)
		mongoClient.Connect(ctx)
	}
}

func (mongoClient *MongoClient) Disconnect(ctx context.Context, trace string) {
	fmt.Printf("MongoClient.Disconnect called by: %v\n", trace)
	if err := mongoClient.instance.Disconnect(ctx); err != nil {
		fmt.Printf("MongoClient.Disconnect failed: %v\n", trace)
		fmt.Println(fmt.Printf("%v", err))
	}
}

func (mongoClient *MongoClient) GetCollection(name string) (*mongo.Collection, error) {
	database := mongoClient.instance.Database(consts.MongoDatabase)
	if database == nil {
		return nil, fmt.Errorf("MongoClient.GetCollection failed: %s", consts.MongoDatabase)
	}
	return database.Collection(name), nil
}

func GetMongoClient(ctx context.Context) (*MongoClient, error) {
	mongoClient, ok := ctx.Value(consts.MongoClientKey).(*MongoClient)
	if !ok {
		return nil, fmt.Errorf("couldn't find %s in context", consts.MongoClientKey)
	}
	mongoClient.Ping(ctx)
	return mongoClient, nil
}

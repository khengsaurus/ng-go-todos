package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, input model.NewUser) (*model.User, error) {
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect()

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	result, err := usersColl.InsertOne(context.TODO(), input)

	if err != nil {
		fmt.Printf("Failed to insert document into %s collection", consts.UsersCollection)
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		return &model.User{
			ID:       oid.Hex(),
			Username: input.Username,
			Email:    input.Email,
		}, err
	}

	return nil, nil
}

// CreateTodo is the resolver for the createTodo field.
func (r *mutationResolver) CreateTodo(ctx context.Context, input model.NewTodo) (*model.Todo, error) {
	// db := store.GetStoreFromContext(ctx)
	// newTodo, err := db.AddTodo(&input)
	// if err != nil {
	// 	return nil, err
	// }

	return nil, nil
}

// GetTodos is the resolver for the getTodos field.
func (r *queryResolver) GetTodos(ctx context.Context, userID string) ([]*model.Todo, error) {
	return nil, nil
}

// GetTodo is the resolver for the getTodo field.
func (r *queryResolver) GetTodo(ctx context.Context, userID string, todoID string) (*model.Todo, error) {
	return nil, nil
}

// GetUsers is the resolver for the getUsers field.
func (r *queryResolver) GetUsers(ctx context.Context) ([]*model.User, error) {
	mongoClient, connectErr := database.GetClient(ctx, true)
	defer mongoClient.Disconnect()

	if connectErr != nil {
		return nil, connectErr
	}

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	findOptions := options.Find()
	findOptions.SetLimit(10)
	cur, findErr := usersColl.Find(context.TODO(), bson.M{}, findOptions)
	if findErr != nil {
		fmt.Printf("%v", findErr)
		return nil, findErr
	}
	defer cur.Close(context.TODO())

	var users []*model.User
	for cur.Next(context.TODO()) {
		var user model.User
		err := cur.Decode(&user)
		if err != nil {
			fmt.Println("Failed to decode user document")
		} else {
			users = append(users, &user)
		}
	}

	return users, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

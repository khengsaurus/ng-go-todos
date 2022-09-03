package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
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
func (r *mutationResolver) CreateUser(ctx context.Context, newUser model.NewUser) (*model.User, error) {
	fmt.Println("CreateUser called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	existCount, _ := usersColl.CountDocuments(ctx, bson.M{"email": newUser.Email})
	if existCount >= 1 {
		return nil, errors.New("user with that email already exists")
	}

	result, err := usersColl.InsertOne(ctx, newUser)
	if err != nil {
		fmt.Printf("Failed to insert document into %s collection", consts.UsersCollection)
	}

	username := ""
	if newUser.Username == nil {
		username = newUser.Email
	} else {
		username = *newUser.Username
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		return &model.User{
			ID:       oid.Hex(),
			Username: username,
			Email:    &newUser.Email,
		}, err
	}

	return nil, errors.New("failed to create user")
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, userID string) (*bool, error) {
	fmt.Println("DeleteUser called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	userId, userIdErr := primitive.ObjectIDFromHex(userID)
	if userIdErr != nil {
		return nil, userIdErr
	}

	filter := bson.D{{Key: "_id", Value: userId}}

	_, err := usersColl.DeleteOne(ctx, filter)
	if err != nil {
		v := false
		return &v, err
	}
	v := true
	return &v, nil
}

// CreateTodo is the resolver for the createTodo field.
func (r *mutationResolver) CreateTodo(ctx context.Context, newTodo model.NewTodo) (*model.Todo, error) {
	fmt.Println("CreateTodo called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	todosColl, collectionErr := mongoClient.GetCollection(consts.TodosCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	userId, userIdErr := primitive.ObjectIDFromHex(newTodo.UserID)
	if userIdErr != nil {
		return nil, userIdErr
	}

	tag := new(string)
	if newTodo.Tag == nil {
		*tag = "white"
	} else {
		tag = newTodo.Tag
	}

	priority := new(int)
	if newTodo.Priority == nil {
		*priority = 2
	} else {
		priority = newTodo.Priority
	}

	result, err := todosColl.InsertOne(ctx, bson.D{
		{Key: "userId", Value: userId},
		{Key: "text", Value: newTodo.Text},
		{Key: "priority", Value: priority},
		{Key: "tag", Value: tag},
		{Key: "done", Value: false},
	})

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		return &model.Todo{
			ID:       oid.Hex(),
			UserID:   newTodo.UserID,
			Text:     newTodo.Text,
			Priority: priority,
			Tag:      tag,
			Done:     false,
		}, err
	}

	return nil, errors.New("failed to create todo")
}

// UpdateTodo is the resolver for the updateTodo field.
func (r *mutationResolver) UpdateTodo(ctx context.Context, updateTodo model.UpdateTodo) (*model.Todo, error) {
	fmt.Println("UpdateTodo called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	todosColl, collectionErr := mongoClient.GetCollection(consts.TodosCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	todoId, todoIdErr := primitive.ObjectIDFromHex(updateTodo.ID)
	if todoIdErr != nil {
		return nil, todoIdErr
	}

	userId, userIdErr := primitive.ObjectIDFromHex(updateTodo.UserID)
	if userIdErr != nil {
		return nil, userIdErr
	}

	filter := bson.D{{Key: "_id", Value: todoId}}
	update := bson.D{{
		Key: "$set",
		Value: bson.D{
			{Key: "userId", Value: userId},
			{Key: "text", Value: updateTodo.Text},
			{Key: "priority", Value: updateTodo.Priority},
			{Key: "tag", Value: updateTodo.Tag},
			{Key: "done", Value: updateTodo.Done},
		}}}

	_, updateTodoErr := todosColl.UpdateOne(ctx, filter, update)
	if updateTodoErr != nil {
		return nil, updateTodoErr
	}

	return &model.Todo{
		ID:       todoId.String(),
		UserID:   updateTodo.UserID,
		Text:     updateTodo.Text,
		Priority: &updateTodo.Priority,
		Tag:      &updateTodo.Tag,
		Done:     false,
	}, nil
}

// DeleteTodo is the resolver for the deleteTodo field.
func (r *mutationResolver) DeleteTodo(ctx context.Context, todoID string) (string, error) {
	fmt.Println("DeleteTodo called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return "", connectErr
	}
	defer mongoClient.Disconnect(ctx)

	todosColl, collectionErr := mongoClient.GetCollection(consts.TodosCollection)
	if collectionErr != nil {
		return "", collectionErr
	}

	todoId, todoIdErr := primitive.ObjectIDFromHex(todoID)
	if todoIdErr != nil {
		return "", todoIdErr
	}
	filter := bson.D{{Key: "_id", Value: todoId}}

	_, deleteErr := todosColl.DeleteOne(ctx, filter)
	if deleteErr != nil {
		return "", deleteErr
	}

	return todoId.String(), nil
}

// GetTodos is the resolver for the getTodos field.
func (r *queryResolver) GetTodos(ctx context.Context, email string) ([]*model.Todo, error) {
	fmt.Println("GetTodos called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	todosColl, collectionErr := mongoClient.GetCollection(consts.TodosCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	filter := bson.D{{Key: "email", Value: email}}
	cur, findErr := todosColl.Find(ctx, filter)
	if findErr != nil {
		return nil, findErr
	}
	defer cur.Close(ctx) // should this be context.TODO()

	var todos []*model.Todo
	for cur.Next(ctx) {
		var todo model.Todo
		err := cur.Decode(&todo)
		if err != nil {
			fmt.Println("Failed to decode todo document")
		} else {
			todos = append(todos, &todo)
		}
	}

	return todos, nil
}

// GetTodo is the resolver for the getTodo field.
func (r *queryResolver) GetTodo(ctx context.Context, todoID string) (*model.Todo, error) {
	fmt.Println("GetTodo called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	todosColl, collectionErr := mongoClient.GetCollection(consts.TodosCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	todoId, todoIdErr := primitive.ObjectIDFromHex(todoID)
	if todoIdErr != nil {
		return nil, todoIdErr
	}

	result := todosColl.FindOne(ctx, bson.M{"_id": todoId})
	var todo model.Todo
	if err := result.Decode(&todo); err != nil {
		return nil, err
	}
	return &todo, nil
}

// GetUsers is the resolver for the getUsers field.
func (r *queryResolver) GetUsers(ctx context.Context) ([]*model.User, error) {
	fmt.Println("GetUsers called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	defer mongoClient.Disconnect(ctx)

	if connectErr != nil {
		return nil, connectErr
	}

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	findOptions := options.Find()
	findOptions.SetLimit(10)
	cur, findErr := usersColl.Find(ctx, bson.M{}, findOptions)
	if findErr != nil {
		fmt.Printf("%v", findErr)
		return nil, findErr
	}
	defer cur.Close(context.TODO())

	var users []*model.User
	for cur.Next(ctx) {
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

// GetUser is the resolver for the getUser field.
func (r *queryResolver) GetUser(ctx context.Context, email string) (*model.User, error) {
	fmt.Println("GetUser called")
	mongoClient, connectErr := database.GetClient(ctx, true)
	if connectErr != nil {
		return nil, connectErr
	}
	defer mongoClient.Disconnect(ctx)

	usersColl, collectionErr := mongoClient.GetCollection(consts.UsersCollection)
	if collectionErr != nil {
		return nil, collectionErr
	}

	result := usersColl.FindOne(ctx, bson.M{"email": email})
	var user model.User
	if err := result.Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

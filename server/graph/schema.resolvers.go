package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"github.com/khengsaurus/ng-gql-todos/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, newUser model.NewUser) (*model.User, error) {
	fmt.Println("CreateUser called")
	usersColl, err := database.GetCollection(ctx, consts.UsersCollection)
	if err != nil {
		return nil, err
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
			BoardIds: []*string{},
		}, err
	}

	return nil, errors.New("failed to create user")
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, userID string) (bool, error) {
	var err error
	if consts.Container {
		err = DeleteUserAsync(ctx, userID)
	} else {
		err = DeleteUserTxn(ctx, userID)
	}
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

// CreateTodo is the resolver for the createTodo field.
func (r *mutationResolver) CreateTodo(ctx context.Context, newTodo model.NewTodo) (*model.Todo, error) {
	fmt.Println("CreateTodo called")
	todosColl, err := database.GetCollection(ctx, consts.TodosCollection)
	if err != nil {
		return nil, err
	}

	userId, err := primitive.ObjectIDFromHex(newTodo.UserID)
	if err != nil {
		return nil, err
	}

	currTime := time.Now()
	result, err := todosColl.InsertOne(ctx, bson.D{
		{Key: "userId", Value: userId},
		{Key: "text", Value: newTodo.Text},
		{Key: "priority", Value: 2},
		{Key: "tag", Value: "white"},
		{Key: "markdown", Value: false},
		{Key: "done", Value: false},
		{Key: "boardId", Value: nil},
		{Key: "createdAt", Value: currTime},
		{Key: "updatedAt", Value: currTime},
	})

	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(newTodo.UserID))
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		return &model.Todo{
			ID:       oid.Hex(),
			UserID:   newTodo.UserID,
			Text:     newTodo.Text,
			Priority: 2,
			Tag:      "white",
			Markdown: false,
			Done:     false,
		}, err
	}

	return nil, errors.New("failed to create todo")
}

// UpdateTodo is the resolver for the updateTodo field.
func (r *mutationResolver) UpdateTodo(ctx context.Context, updateTodo model.UpdateTodo) (bool, error) {
	fmt.Println("UpdateTodo called")
	todosColl, err := database.GetCollection(ctx, consts.TodosCollection)
	if err != nil {
		return false, err
	}

	todoId, err := primitive.ObjectIDFromHex(updateTodo.ID)
	if err != nil {
		return false, err
	}

	userId, err := primitive.ObjectIDFromHex(updateTodo.UserID)
	if err != nil {
		return false, err
	}

	filter := bson.D{{Key: "_id", Value: todoId}}
	updateVals := bson.D{
		{Key: "userId", Value: userId},
		{Key: "updatedAt", Value: time.Now()},
	}
	if updateTodo.BoardID != nil {
		updateVals = append(updateVals, bson.E{Key: "boardId", Value: updateTodo.BoardID})
	}
	if updateTodo.Text != nil {
		updateVals = append(updateVals, bson.E{Key: "text", Value: updateTodo.Text})
	}
	if updateTodo.Priority != nil {
		updateVals = append(updateVals, bson.E{Key: "priority", Value: updateTodo.Priority})
	}
	if updateTodo.Tag != nil {
		updateVals = append(updateVals, bson.E{Key: "tag", Value: updateTodo.Tag})
	}
	if updateTodo.Markdown != nil {
		updateVals = append(updateVals, bson.E{Key: "markdown", Value: updateTodo.Markdown})
	}
	if updateTodo.Done != nil {
		updateVals = append(updateVals, bson.E{Key: "done", Value: updateTodo.Done})
	}

	update := bson.M{"$set": updateVals}
	_, err = todosColl.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(updateTodo.UserID))

	return true, nil
}

// DeleteTodo is the resolver for the deleteTodo field.
func (r *mutationResolver) DeleteTodo(ctx context.Context, userID string, todoID string) (bool, error) {
	var err error
	if consts.Container {
		err = DeleteTodoAsync(ctx, userID, todoID)
	} else {
		err = DeleteTodoTxn(ctx, userID, todoID)
	}
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	return true, nil
}

// CreateBoard is the resolver for the createBoard field.
func (r *mutationResolver) CreateBoard(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	var board *model.Board
	var err error
	if consts.Container {
		board, err = CreateBoardAsync(ctx, newBoard)
	} else {
		board, err = CreateBoardTxn(ctx, newBoard)
	}
	if err != nil {
		return nil, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(newBoard.UserID))
	return board, nil
}

// UpdateBoard is the resolver for the updateBoard field.
func (r *mutationResolver) UpdateBoard(ctx context.Context, updateBoard model.UpdateBoard) (bool, error) {
	fmt.Println("UpdateBoard called")
	boardsColl, err := database.GetCollection(ctx, consts.BoardsCollection)
	if err != nil {
		return false, err
	}

	boardId, err := primitive.ObjectIDFromHex(updateBoard.ID)
	if err != nil {
		return false, err
	}

	filter := bson.D{{Key: "_id", Value: boardId}}
	update := bson.D{{
		Key: "$set",
		Value: bson.D{
			{Key: "todos", Value: updateBoard.Todos},
			{Key: "name", Value: updateBoard.Name},
			{Key: "updatedAt", Value: time.Now()},
		},
	}}
	_, err = boardsColl.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(updateBoard.UserID))

	return true, nil
}

// DeleteBoard is the resolver for the deleteBoard field.
func (r *mutationResolver) DeleteBoard(ctx context.Context, userID string, boardID string) (bool, error) {
	var err error
	if consts.Container {
		err = DeleteBoardAsync(ctx, userID, boardID)
	} else {
		err = DeleteBoardTxn(ctx, userID, boardID)
	}
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

// MoveTodos is the resolver for the moveTodos field.
func (r *mutationResolver) MoveTodos(ctx context.Context, userID string, boardID string, todoIds []string) (bool, error) {
	fmt.Println("MoveTodos called")
	boardsColl, err := database.GetCollection(ctx, consts.BoardsCollection)
	if err != nil {
		return false, err
	}

	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": boardId}
	update := bson.M{"$set": bson.M{
		"todoIds": todoIds,
	}}
	_, err = boardsColl.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(boardID))

	return true, nil
}

// MoveBoards is the resolver for the moveBoards field.
func (r *mutationResolver) MoveBoards(ctx context.Context, userID string, boardIds []string) (bool, error) {
	fmt.Println("MoveBoards called")
	usersColl, err := database.GetCollection(ctx, consts.UsersCollection)
	if err != nil {
		return false, err
	}

	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": userId}
	update := bson.M{"$set": bson.M{"boardIds": boardIds}}
	_, err = usersColl.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))

	return true, nil
}

// AddTodoToBoard is the resolver for the addTodoToBoard field.
func (r *mutationResolver) AddTodoToBoard(ctx context.Context, userID string, todoID string, boardID string) (bool, error) {
	var err error
	if consts.Container {
		err = AddTodoToBoardAsync(ctx, todoID, boardID)
	} else {
		err = AddTodoToBoardTxn(ctx, todoID, boardID)
	}

	if err != nil {
		return false, nil
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

// RemoveTodoFromBoard is the resolver for the removeTodoFromBoard field.
func (r *mutationResolver) RemoveTodoFromBoard(ctx context.Context, userID string, todoID string, boardID string) (bool, error) {
	var err error
	if consts.Container {
		err = RemoveTodoFromBoardAsync(ctx, todoID, boardID)
	} else {
		err = RemoveTodoFromBoardTxn(ctx, todoID, boardID)
	}
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

// ShiftTodoBetweenBoards is the resolver for the shiftTodoBetweenBoards field.
func (r *mutationResolver) ShiftTodoBetweenBoards(ctx context.Context, userID string, todoID string, fromBoard string, toBoard string, toIndex int) (bool, error) {
	var err error
	if consts.Container {
		err = ShiftTodoBetweenBoardsAsync(ctx, todoID, fromBoard, toBoard, toIndex)
	} else {
		err = ShiftTodoBetweenBoardsTxn(ctx, todoID, fromBoard, toBoard, toIndex)
	}
	if err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

// GetUser is the resolver for the getUser field.
func (r *queryResolver) GetUser(ctx context.Context, email string) (*model.User, error) {
	fmt.Println("GetUser called")
	usersColl, err := database.GetCollection(ctx, consts.UsersCollection)
	if err != nil {
		return nil, err
	}

	result := usersColl.FindOne(ctx, bson.M{"email": email})
	var user model.User
	if err := result.Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUsers is the resolver for the getUsers field.
func (r *queryResolver) GetUsers(ctx context.Context) ([]*model.User, error) {
	fmt.Println("GetUsers called")
	usersColl, err := database.GetCollection(ctx, consts.UsersCollection)
	if err != nil {
		return nil, err
	}

	findOptions := options.Find()
	findOptions.SetLimit(5)
	cursor, err := usersColl.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*model.User
	for cursor.Next(ctx) {
		var user model.User
		err := cursor.Decode(&user)
		if err != nil {
			fmt.Printf("Failed to decode user document: %v\n", err)
		} else {
			users = append(users, &user)
		}
	}

	return users, nil
}

// GetTodo is the resolver for the getTodo field.
func (r *queryResolver) GetTodo(ctx context.Context, todoID string) (*model.Todo, error) {
	fmt.Println("GetTodo called")
	todosColl, err := database.GetCollection(ctx, consts.TodosCollection)
	if err != nil {
		return nil, err
	}

	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return nil, err
	}

	result := todosColl.FindOne(ctx, bson.M{"_id": todoId})
	var todo model.Todo
	if err := result.Decode(&todo); err != nil {
		return nil, err
	}
	return &todo, nil
}

// GetTodos is the resolver for the getTodos field.
func (r *queryResolver) GetTodos(ctx context.Context, userID string, fresh bool) (*model.GetTodosRes, error) {
	fmt.Println("GetTodos called")
	redisClient, redisClientErr := database.GetRedisClient(ctx)
	if !fresh && redisClient != nil {
		cachedTodos, _ := redisClient.GetTodos(ctx, userID)
		if cachedTodos != nil {
			fmt.Println("Retrieved todos from redis cache")
			return &model.GetTodosRes{
				Todos: cachedTodos,
				Cache: true,
			}, nil
		}
	}

	todosColl, err := database.GetCollection(ctx, consts.TodosCollection)
	if err != nil {
		return nil, err
	}

	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	filter := bson.D{{Key: "userId", Value: userId}}
	cursor, err := todosColl.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var todos []*model.Todo
	for cursor.Next(ctx) {
		var todo model.Todo
		err := cursor.Decode(&todo)
		if err != nil {
			fmt.Println("Failed to decode todo document:")
			fmt.Println(fmt.Printf("%v", err))
		} else {
			todos = append(todos, &todo)
		}
	}

	if redisClient != nil && redisClientErr == nil {
		redisClient.SetTodos(ctx, userID, todos)
	}

	return &model.GetTodosRes{
		Todos: todos,
		Cache: false,
	}, nil
}

// GetBoard is the resolver for the getBoard field.
func (r *queryResolver) GetBoard(ctx context.Context, boardID string) (*model.Board, error) {
	fmt.Println("GetBoard called")
	boardsColl, err := database.GetCollection(ctx, consts.BoardsCollection)
	if err != nil {
		return nil, err
	}

	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return nil, err
	}

	aggSearch := bson.M{"$match": bson.M{"_id": boardId}}
	// NB: $lookup does not maintain array order - https://stackoverflow.com/questions/55033804
	aggPopulate := bson.M{"$lookup": bson.M{
		"from":         consts.TodosCollection,
		"localField":   "todos",
		"foreignField": "_id",
		"as":           "todos",
	}}

	cursor, err := boardsColl.Aggregate(ctx, []bson.M{aggSearch, aggPopulate})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var board model.Board
		if err := cursor.Decode(&board); err != nil {
			return nil, err
		}
		board.OrderTodos()
		return &board, nil
	}

	return nil, errors.New("MongoDB aggregate error - failed to create cursor in getBoard resolver - document may not exist")
}

// GetBoards is the resolver for the getBoards field.
func (r *queryResolver) GetBoards(ctx context.Context, userID string, fresh bool) (*model.GetBoardsRes, error) {
	fmt.Println("GetBoards called")
	redisClient, redisClientErr := database.GetRedisClient(ctx)
	if !fresh && redisClient != nil {
		cachedBoards, _ := redisClient.GetBoards(ctx, userID)
		if cachedBoards != nil {
			fmt.Println("Retrieved boards from redis cache")
			return &model.GetBoardsRes{
				Boards: cachedBoards,
				Cache:  true,
			}, nil
		}
	}

	boardsColl, err := database.GetCollection(ctx, consts.BoardsCollection)
	if err != nil {
		return nil, err
	}

	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	aggSearch := bson.M{"$match": bson.M{"userId": userId}}
	aggPopulate := bson.M{"$lookup": bson.M{
		"from":         consts.TodosCollection,
		"localField":   "todos",
		"foreignField": "_id",
		"as":           "todos",
	}}

	cursor, err := boardsColl.Aggregate(ctx, []bson.M{aggSearch, aggPopulate})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	boards := make([]*model.Board, 0)
	for cursor.Next(ctx) {
		var board model.Board
		err := cursor.Decode(&board)
		if err != nil {
			fmt.Printf("Failed to decode board document: %v", err)
		} else {
			board.OrderTodos()
			boards = append(boards, &board)
		}
	}

	if redisClient != nil && redisClientErr == nil {
		redisClient.SetBoards(ctx, userID, boards)
	}

	return &model.GetBoardsRes{
		Boards: boards,
		Cache:  false,
	}, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

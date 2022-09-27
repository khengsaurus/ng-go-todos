package graph

import (
	"context"
	"fmt"
	"time"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"github.com/khengsaurus/ng-gql-todos/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
)

// With a session transaction, create a new board and append its id to user's boardIds
func CreateBoardTxn(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	fmt.Println("CreateBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return nil, err
	}
	defer session.EndSession(ctx)

	boardsColl := db.Collection(consts.BoardsCollection)
	usersColl := db.Collection(consts.UsersCollection)

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	txnOpts := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)
	var createdBoard *model.Board

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(txnOpts); err != nil {
			return err
		}

		userId, err := primitive.ObjectIDFromHex(newBoard.UserID)
		if err != nil {
			return err
		}

		// Create new board
		currTime := time.Now()
		newBoardDoc := bson.D{
			{Key: "userId", Value: userId},
			{Key: "name", Value: newBoard.Name},
			{Key: "todos", Value: []*model.Todo{}},
			{Key: "todoIds", Value: []*string{}},
			{Key: "createdAt", Value: currTime},
			{Key: "updatedAt", Value: currTime},
		}
		result, err := boardsColl.InsertOne(sessionContext, newBoardDoc)
		if err != nil {
			return err
		}

		oid, ok := result.InsertedID.(primitive.ObjectID)
		var boardId string
		if ok {
			boardId = oid.Hex()
			createdBoard = &model.Board{
				ID:      boardId,
				Name:    newBoard.Name,
				UserID:  newBoard.UserID,
				Todos:   []*model.Todo{},
				TodoIds: []*string{},
			}
		} else {
			return fmt.Errorf("CreateBoard transaction mode - error creating document")
		}

		// Append boardId to user's boardIds
		update := bson.M{"$push": bson.M{"boardIds": boardId}}
		usersFilter := bson.D{{Key: "_id", Value: userId}}
		_, err = usersColl.UpdateOne(ctx, usersFilter, update)
		if err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("CreateBoard - transaction error: %v\nCreateBoard - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return nil, abortErr
		} else {
			return nil, err
		}
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(newBoard.UserID))
	return createdBoard, nil
}

func CreateBoardAsync(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	fmt.Println("CreateBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return nil, err
	}
	usersColl := db.Collection(consts.UsersCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	userId, err := primitive.ObjectIDFromHex(newBoard.UserID)
	if err != nil {
		return nil, err
	}

	currTime := time.Now()
	newBoardDoc := bson.D{
		{Key: "userId", Value: userId},
		{Key: "name", Value: newBoard.Name},
		{Key: "todos", Value: []*model.Todo{}},
		{Key: "todoIds", Value: []*string{}},
		{Key: "createdAt", Value: currTime},
		{Key: "updatedAt", Value: currTime},
	}
	result, err := boardsColl.InsertOne(ctx, newBoardDoc)
	if err != nil {
		return nil, err
	}

	var createdBoard *model.Board
	oid, ok := result.InsertedID.(primitive.ObjectID)
	var boardId string
	if ok {
		boardId = oid.Hex()
		createdBoard = &model.Board{
			ID:      boardId,
			Name:    newBoard.Name,
			UserID:  newBoard.UserID,
			Todos:   []*model.Todo{},
			TodoIds: []*string{},
		}
	} else {
		return nil, fmt.Errorf("CreateBoard async mode - error creating document")
	}

	update := bson.M{"$push": bson.M{"boardIds": boardId}}
	usersFilter := bson.D{{Key: "_id", Value: userId}}
	_, err = usersColl.UpdateOne(ctx, usersFilter, update)
	if err != nil {
		return nil, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(newBoard.UserID))
	return createdBoard, nil
}

/* ---------------------------------------- Delete Todo ----------------------------------------*/

func DeleteTodoCallback(
	ctx context.Context,
	todoID string,
	userID string,
	db *mongo.Database,
) error {
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	// Delete todo
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	_, err = todosColl.DeleteOne(ctx, bson.M{"_id": todoId})
	if err != nil {
		return err
	}

	// Delete todo from boards by user
	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	filter := bson.M{"userId": userId}
	update := bson.M{"$pull": bson.M{
		"todos":   todoId,
		"todoIds": todoID,
	}}
	_, err = boardsColl.UpdateMany(ctx, filter, update)
	if err != nil {
		return err
	}

	return nil
}

func DeleteTodoTxn(ctx context.Context, userID string, todoID string) (bool, error) {
	fmt.Println("DeleteTodo called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return false, err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteTodoCallback(sessionContext, todoID, userID, db); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("DeleteTodo - transaction error: %v\nDeleteTodo - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return false, abortErr
		} else {
			return false, err
		}
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	return true, nil
}

func DeleteTodoAsync(ctx context.Context, userID string, todoID string) (bool, error) {
	fmt.Println("DeleteTodo called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return false, err
	}

	if err = DeleteTodoCallback(ctx, todoID, userID, db); err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	return true, nil
}

/* ---------------------------------------- Delete Board ----------------------------------------*/

func DeleteBoardCallback(
	ctx context.Context,
	userID string,
	boardID string,
	db *mongo.Database,
) error {
	usersColl := db.Collection(consts.UsersCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	// Delete board
	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return err
	}
	_, err = boardsColl.DeleteOne(ctx, bson.M{"_id": boardId})
	if err != nil {
		return err
	}

	// Delete board from user
	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	filter := bson.M{"_id": userId}
	update := bson.M{"$pull": bson.M{
		"boardIds": boardID,
	}}
	_, err = usersColl.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	return nil
}

func DeleteBoardTxn(ctx context.Context, userID string, boardID string) (bool, error) {
	fmt.Println("DeleteBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return false, err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteBoardCallback(ctx, userID, boardID, db); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		fmt.Printf("DeleteBoard - transaction error: %v\nDeleteBoard - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return false, abortErr
		} else {
			return false, err
		}
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

func DeleteBoardAsync(ctx context.Context, userID string, boardID string) (bool, error) {
	fmt.Println("DeleteBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return false, err
	}

	if err = DeleteBoardCallback(ctx, userID, boardID, db); err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

/* ---------------------------------------- Delete User ----------------------------------------*/

func DeleteUserCallback(
	ctx context.Context,
	db *mongo.Database,
	userID string,
) error {
	usersColl := db.Collection(consts.UsersCollection)
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)
	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	// Delete user
	if _, err = usersColl.DeleteOne(ctx, bson.M{"_id": userId}); err != nil {
		return err
	}

	// Delete todos
	userFilter := bson.M{"userId": userId}
	if _, err = todosColl.DeleteMany(ctx, userFilter); err != nil {
		return err
	}

	// Delete boards
	if _, err = boardsColl.DeleteMany(ctx, userFilter); err != nil {
		return err
	}

	return nil
}

// Delete all documents associated to a user
func DeleteUserTxn(ctx context.Context, userID string) (bool, error) {
	fmt.Println("DeleteUser called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return false, err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteUserCallback(ctx, db, userID); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("CreateBoard - transaction error: %v\nDeleteUser - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return false, abortErr
		} else {
			return false, err
		}
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

func DeleteUserAsync(ctx context.Context, userID string) (bool, error) {
	fmt.Println("DeleteUser called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return false, err
	}

	if err = DeleteUserCallback(ctx, db, userID); err != nil {
		return false, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return true, nil
}

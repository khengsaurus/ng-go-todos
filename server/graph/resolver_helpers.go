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

// Delete all documents associated to a user
func DeleteUserTxn(ctx context.Context, userID string) (*bool, error) {
	fmt.Println("DeleteUserTxn called")

	v := false
	session, db, err := database.GetSession(ctx)
	if err != nil {
		return &v, err
	}
	defer session.EndSession(ctx)

	usersColl := db.Collection(consts.UsersCollection)
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	wc := writeconcern.New(writeconcern.WMajority())
	rc := readconcern.Snapshot()
	txnOpts := options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(txnOpts); err != nil {
			return err
		}

		userId, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			return err
		}

		// Delete user
		_, err = usersColl.DeleteOne(sessionContext, bson.M{"_id": userId})
		if err != nil {
			return err
		}

		// Delete todos
		userFilter := bson.M{"userId": userId}
		_, err = todosColl.DeleteMany(sessionContext, userFilter)
		if err != nil {
			return err
		}

		// Delete boards
		_, err = boardsColl.DeleteMany(sessionContext, userFilter)
		if err != nil {
			return err
		}

		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("CreateBoard - error in transaction: %v\nCreateBoard - Aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return &v, abortErr
		} else {
			return &v, err
		}
	}

	v = true
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return &v, nil
}

func DeleteUserAsync(ctx context.Context, userID string) (*bool, error) {
	fmt.Println("DeleteUserTxn called")

	v := false
	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return &v, err
	}
	usersColl := db.Collection(consts.UsersCollection)
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return &v, err
	}

	// Delete user
	_, err = usersColl.DeleteOne(ctx, bson.M{"_id": userId})
	if err != nil {
		return &v, err
	}

	// Delete todos
	userFilter := bson.M{"userId": userId}
	_, err = todosColl.DeleteMany(ctx, userFilter)
	if err != nil {
		return &v, err
	}

	// Delete boards
	_, err = boardsColl.DeleteMany(ctx, userFilter)
	if err != nil {
		return &v, err
	}

	v = true
	database.RemoveKeyFromRedis(ctx, utils.GetUserTodosKey(userID))
	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(userID))
	return &v, nil
}

// With a session transaction, create a new board and append its id to user's boardIds
func CreateBoardTxn(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	fmt.Println("CreateBoardTxn called")

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
		todos := make([]*primitive.ObjectID, 0)
		for _, s := range newBoard.TodoIds {
			todoId, err := primitive.ObjectIDFromHex(*s)
			if err == nil {
				todos = append(todos, &todoId)
			}
		}

		currTime := time.Now()
		newBoardDoc := bson.D{
			{Key: "userId", Value: userId},
			{Key: "name", Value: newBoard.Name},
			{Key: "todos", Value: todos},
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
				ID:     boardId,
				Name:   newBoard.Name,
				UserID: newBoard.UserID,
				Todos:  []*model.Todo{},
			}
		} else {
			return fmt.Errorf("error in creating board document during MongoClient session transaction")
		}

		// Append boardId to user's boardIds
		update := bson.M{"$push": bson.M{"boards": boardId}}
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
		fmt.Printf("CreateBoard - error in transaction: %v\nCreateBoard - Aborting transaction\n", err)
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
	fmt.Println("CreateBoardAsync called")

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

	todos := make([]*primitive.ObjectID, 0)
	for _, s := range newBoard.TodoIds {
		todoId, err := primitive.ObjectIDFromHex(*s)
		if err == nil {
			todos = append(todos, &todoId)
		}
	}

	currTime := time.Now()
	newBoardDoc := bson.D{
		{Key: "userId", Value: userId},
		{Key: "name", Value: newBoard.Name},
		{Key: "todos", Value: todos},
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
			ID:     boardId,
			Name:   newBoard.Name,
			UserID: newBoard.UserID,
			Todos:  []*model.Todo{},
		}
	} else {
		return nil, fmt.Errorf("error in creating board document during MongoClient session transaction")
	}

	update := bson.M{"$push": bson.M{"boards": boardId}}
	usersFilter := bson.D{{Key: "_id", Value: userId}}
	_, err = usersColl.UpdateOne(ctx, usersFilter, update)
	if err != nil {
		return nil, err
	}

	database.RemoveKeyFromRedis(ctx, utils.GetUserBoardsKey(newBoard.UserID))
	return createdBoard, nil
}

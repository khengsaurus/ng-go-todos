package graph

import (
	"context"
	"fmt"
	"time"

	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/database"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

/* ---------------------------------------- Create board ----------------------------------------*/
// Create a new board and append its id to user's boardIds

func CreateBoardCB(
	ctx context.Context,
	db *mongo.Database,
	newBoard model.NewBoard,
) (*model.Board, error) {
	userId, err := primitive.ObjectIDFromHex(newBoard.UserID)
	if err != nil {
		return nil, err
	}

	boardsColl := db.Collection(consts.BoardsCollection)
	currTime := time.Now()
	boardDoc := bson.D{
		{Key: "userId", Value: userId},
		{Key: "name", Value: newBoard.Name},
		{Key: "todos", Value: []*model.Todo{}},
		{Key: "todoIds", Value: []*string{}},
		{Key: "createdAt", Value: currTime},
		{Key: "updatedAt", Value: currTime},
	}
	result, err := boardsColl.InsertOne(ctx, boardDoc)
	if err != nil {
		return nil, err
	}

	oid, ok := result.InsertedID.(primitive.ObjectID)
	var board *model.Board
	var boardId string
	if ok {
		boardId = oid.Hex()
		board = &model.Board{
			ID:      boardId,
			Name:    newBoard.Name,
			UserID:  newBoard.UserID,
			Todos:   []*model.Todo{},
			TodoIds: []*string{},
		}
	} else {
		return nil, fmt.Errorf("CreateBoard transaction mode - error creating document")
	}

	usersColl := db.Collection(consts.UsersCollection)
	userFilter := bson.M{"_id": userId}
	userUpdate := bson.M{"$push": bson.M{"boardIds": boardId}}
	if _, err = usersColl.UpdateOne(ctx, userFilter, userUpdate); err != nil {
		return nil, err
	}

	return board, nil
}

func CreateBoardTxn(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	fmt.Println("CreateBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return nil, err
	}
	defer session.EndSession(ctx)

	var board *model.Board
	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}

		board, err = CreateBoardCB(ctx, db, newBoard)
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

	return board, nil
}

func CreateBoardAsync(ctx context.Context, newBoard model.NewBoard) (*model.Board, error) {
	fmt.Println("CreateBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return nil, err
	}

	return CreateBoardCB(ctx, db, newBoard)
}

/* ---------------------------------------- Delete todo ----------------------------------------*/

func DeleteTodoCB(
	ctx context.Context,
	db *mongo.Database,
	todoID string,
	userID string,
) error {
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	// Delete todo
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	if _, err = todosColl.DeleteOne(ctx, bson.M{"_id": todoId}); err != nil {
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
	if _, err = boardsColl.UpdateMany(ctx, filter, update); err != nil {
		return err
	}

	return nil
}

func DeleteTodoTxn(ctx context.Context, userID string, todoID string) error {
	fmt.Println("DeleteTodo called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteTodoCB(sessionContext, db, todoID, userID); err != nil {
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
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func DeleteTodoAsync(ctx context.Context, userID string, todoID string) error {
	fmt.Println("DeleteTodo called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return DeleteTodoCB(ctx, db, todoID, userID)
}

/* ---------------------------------------- Delete board ----------------------------------------*/

func DeleteBoardCB(
	ctx context.Context,
	db *mongo.Database,
	userID string,
	boardID string,
) error {
	// Delete board
	boardsColl := db.Collection(consts.BoardsCollection)
	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return err
	}
	if _, err = boardsColl.DeleteOne(ctx, bson.M{"_id": boardId}); err != nil {
		return err
	}

	// Delete board from user
	usersColl := db.Collection(consts.UsersCollection)
	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	userFilter := bson.M{"_id": userId}
	userUpdate := bson.M{"$pull": bson.M{"boardIds": boardID}}
	if _, err = usersColl.UpdateOne(ctx, userFilter, userUpdate); err != nil {
		return err
	}

	// Delete board from any todos' boardId
	todosColl := db.Collection(consts.TodosCollection)
	todosFilter := bson.M{"boardId": boardID}
	todosUpdate := bson.M{"$set": bson.M{"boardId": ""}}
	if _, err = todosColl.UpdateMany(ctx, todosFilter, todosUpdate); err != nil {
		return err
	}

	return nil
}

func DeleteBoardTxn(ctx context.Context, userID string, boardID string) error {
	fmt.Println("DeleteBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteBoardCB(ctx, db, userID, boardID); err != nil {
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
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func DeleteBoardAsync(ctx context.Context, userID string, boardID string) error {
	fmt.Println("DeleteBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return DeleteBoardCB(ctx, db, userID, boardID)
}

/* ---------------------------------------- Delete user ----------------------------------------*/
// Delete a user's doc and all user's todos and boards

func DeleteUserCB(
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

	if _, err = usersColl.DeleteOne(ctx, bson.M{"_id": userId}); err != nil {
		return err
	}

	userFilter := bson.M{"userId": userId}
	if _, err = todosColl.DeleteMany(ctx, userFilter); err != nil {
		return err
	}

	if _, err = boardsColl.DeleteMany(ctx, userFilter); err != nil {
		return err
	}

	return nil
}

func DeleteUserTxn(ctx context.Context, userID string) error {
	fmt.Println("DeleteUser called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = DeleteUserCB(ctx, db, userID); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("DeleteUser - transaction error: %v\nDeleteUser - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func DeleteUserAsync(ctx context.Context, userID string) error {
	fmt.Println("DeleteUser called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return DeleteUserCB(ctx, db, userID)
}

/* ---------------------------------------- Add todo to board ----------------------------------------*/
// Set boardId on todo & add todo to board

func AddTodoToBoardCB(
	ctx context.Context,
	db *mongo.Database,
	todoID string,
	boardID string,
) error {
	todosColl := db.Collection(consts.TodosCollection)
	boardsColl := db.Collection(consts.BoardsCollection)

	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": boardID}}
	if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return err
	}

	boardFilter := bson.M{"_id": boardId}
	boardUpdate := bson.M{
		"$push": bson.M{
			"todoIds": bson.M{
				"$each":     []string{todoID},
				"$position": 0,
			},
			"todos": bson.M{
				"$each":     []primitive.ObjectID{todoId},
				"$position": 0,
			},
		},
	}

	if _, err = boardsColl.UpdateOne(ctx, boardFilter, boardUpdate); err != nil {
		return err
	}

	return nil
}

func AddTodoToBoardTxn(ctx context.Context, todoID string, boardID string) error {
	fmt.Println("AddTodoToBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = AddTodoToBoardCB(ctx, db, todoID, boardID); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("AddTodoToBoard - transaction error: %v\nAddTodoToBoard - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func AddTodoToBoardAsync(ctx context.Context, todoID string, boardID string) error {
	fmt.Println("AddTodoToBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return AddTodoToBoardCB(ctx, db, todoID, boardID)
}

/* ---------------------------------------- Remove todo from board ----------------------------------------*/

func RemoveTodoFromBoardCB(
	ctx context.Context,
	db *mongo.Database,
	todoID string,
	boardID string,
) error {
	todosColl := db.Collection(consts.TodosCollection)
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}

	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": ""}}
	if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	boardsColl := db.Collection(consts.BoardsCollection)
	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return err
	}

	boardFilter := bson.M{"_id": boardId}
	boardUpdate := bson.M{"$pull": bson.M{
		"todoIds": todoID,
		"todos":   todoId,
	}}
	if _, err = boardsColl.UpdateOne(ctx, boardFilter, boardUpdate); err != nil {
		return err
	}

	return nil
}

func RemoveTodoFromBoardTxn(
	ctx context.Context,
	todoID string,
	boardID string,
) error {
	fmt.Println("RemoveTodoFromBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = RemoveTodoFromBoardCB(ctx, db, todoID, boardID); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("RemoveTodoFromBoard - transaction error: %v\nRemoveTodoFromBoard - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func RemoveTodoFromBoardAsync(
	ctx context.Context,
	todoID string,
	boardID string,
) error {
	fmt.Println("RemoveTodoFromBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return RemoveTodoFromBoardCB(ctx, db, todoID, boardID)
}

/* ---------------------------------------- Shift todo between boards ----------------------------------------*/
// Remove todoId from fromBoard and add to toBoard at toIndex

func ShiftTodoBetweenBoardsCB(
	ctx context.Context,
	db *mongo.Database,
	todoID string,
	fromBoard string,
	toBoard string,
	toIndex int,
) error {
	todosColl := db.Collection(consts.TodosCollection)
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}

	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": toBoard}}
	if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	boardsColl := db.Collection(consts.BoardsCollection)
	fromBoardId, err := primitive.ObjectIDFromHex(fromBoard)
	if err != nil {
		return err
	}
	fromBoardFilter := bson.M{"_id": fromBoardId}
	fromBoardUpdate := bson.M{"$pull": bson.M{
		"todos":   todoId,
		"todoIds": todoID,
	}}
	if _, err = boardsColl.UpdateOne(ctx, fromBoardFilter, fromBoardUpdate); err != nil {
		return err
	}

	toBoardId, err := primitive.ObjectIDFromHex(toBoard)
	if err != nil {
		return err
	}
	toBoardFilter := bson.M{"_id": toBoardId}
	toBoardUpdate := bson.M{
		"$push": bson.M{
			"todoIds": bson.M{
				"$each":     []string{todoID},
				"$position": toIndex,
			},
			"todos": bson.M{
				"$each":     []primitive.ObjectID{todoId},
				"$position": 0,
			},
		},
	}

	if _, err = boardsColl.UpdateOne(ctx, toBoardFilter, toBoardUpdate); err != nil {
		return err
	}

	return nil
}

func ShiftTodoBetweenBoardsTxn(
	ctx context.Context,
	todoID string,
	fromBoard string,
	toBoard string,
	toIndex int,
) error {
	fmt.Println("ShiftTodoBetweenBoards called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
			return err
		}
		if err = ShiftTodoBetweenBoardsCB(ctx, db, todoID, fromBoard, toBoard, toIndex); err != nil {
			return err
		}
		if err = session.CommitTransaction(sessionContext); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("ShiftTodoBetweenBoards - transaction error: %v\nShiftTodoBetweenBoards - aborting transaction\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func ShiftTodoBetweenBoardsAsync(
	ctx context.Context,
	todoID string,
	fromBoard string,
	toBoard string,
	toIndex int,
) error {
	fmt.Println("ShiftTodoBetweenBoards called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	return ShiftTodoBetweenBoardsCB(ctx, db, todoID, fromBoard, toBoard, toIndex)
}

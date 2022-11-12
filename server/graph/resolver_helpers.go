package graph

import (
	"context"
	"fmt"
	"time"

	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/khengsaurus/ng-go-todos/database"
	"github.com/khengsaurus/ng-go-todos/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CallbackContext struct {
	ctx context.Context
	db  *mongo.Database
}

/* ---------------------------------------- Create board ----------------------------------------*/
// Create a new board and append its id to user's boardIds

func (cbCtx CallbackContext) CreateBoardCB(
	newBoard model.NewBoard,
) (*model.Board, error) {
	userId, err := primitive.ObjectIDFromHex(newBoard.UserID)
	if err != nil {
		return nil, err
	}

	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)
	currTime := time.Now()
	boardDoc := bson.D{
		{Key: "userId", Value: userId},
		{Key: "name", Value: newBoard.Name},
		{Key: "todos", Value: []*model.Todo{}},
		{Key: "todoIds", Value: []*string{}},
		{Key: "createdAt", Value: currTime},
		{Key: "updatedAt", Value: currTime},
	}
	result, err := boardsColl.InsertOne(cbCtx.ctx, boardDoc)
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

	usersColl := cbCtx.db.Collection(consts.UsersCollection)
	userFilter := bson.M{"_id": userId}
	userUpdate := bson.M{"$push": bson.M{"boardIds": boardId}}
	if _, err = usersColl.UpdateOne(cbCtx.ctx, userFilter, userUpdate); err != nil {
		return nil, err
	}

	return board, nil
}

func CreateBoardTxn(
	ctx context.Context,
	newBoard model.NewBoard,
) (*model.Board, error) {
	fmt.Println("CreateBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return nil, err
	}
	defer session.EndSession(ctx)

	var board *model.Board
	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			board, err = cbCtx.CreateBoardCB(newBoard)
			if err != nil {
				return err
			}

			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("CreateBoard - txn error: %v\nCreateBoard - aborting txn\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return nil, abortErr
		} else {
			return nil, err
		}
	}

	return board, nil
}

func CreateBoardAsync(
	ctx context.Context,
	newBoard model.NewBoard,
) (*model.Board, error) {
	fmt.Println("CreateBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return nil, err
	}

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.CreateBoardCB(newBoard)
}

/* ---------------------------------------- Delete todo ----------------------------------------*/

func (cbCtx CallbackContext) DeleteTodoCB(todoID string, userID string) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)

	// Delete todo
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	if _, err = todosColl.DeleteOne(cbCtx.ctx, bson.M{"_id": todoId}); err != nil {
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
	if _, err = boardsColl.UpdateMany(cbCtx.ctx, filter, update); err != nil {
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

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.DeleteTodoCB(todoID, userID); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("DeleteTodo - txn error: %v\nDeleteTodo - aborting txn\n", err)
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

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.DeleteTodoCB(todoID, userID)
}

/* -------------------------------------- Add file to todo --------------------------------------*/

func (cbCtx CallbackContext) AddFileToTodoCB(
	todoID string,
	fileKey string,
	fileName string,
	uploaded string,
) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)

	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{
		"$push": bson.M{
			"files": bson.M{
				"key":      fileKey,
				"name":     fileName,
				"uploaded": uploaded,
			},
		},
	}
	if _, err = todosColl.UpdateOne(cbCtx.ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	return nil
}

func AddFileToTodoTxn(
	ctx context.Context,
	todoID string,
	fileKey string,
	fileName string,
	uploaded string,
) error {
	fmt.Println("AddFileToTodo called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.AddFileToTodoCB(todoID, fileKey, fileName, uploaded); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}

			return nil
		},
	)

	if err != nil {
		fmt.Printf("AddFileToTodo - txn error: %v\nAddFileToTodo - aborting txn\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func AddFileToTodoAsync(
	ctx context.Context,
	todoID string,
	fileKey string,
	fileName string,
	uploaded string,
) error {
	fmt.Println("AddFileToTodo called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.AddFileToTodoCB(todoID, fileKey, fileName, uploaded)
}

/* ------------------------------------ Remove file from todo ------------------------------------*/

func (cbCtx CallbackContext) RemoveFileFromFromTodoCB(
	todoID string,
	fileKey string,
	fileName string,
) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}

	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$pull": bson.M{"files": bson.M{"name": fileName}}}
	if _, err = todosColl.UpdateOne(cbCtx.ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	return nil
}

func RmFileFromTodoTxn(
	ctx context.Context,
	todoID string,
	fileKey string,
	fileName string,
) error {
	fmt.Println("RmFileFromTodo called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.RemoveFileFromFromTodoCB(todoID, fileKey, fileName); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}

			return nil
		})

	if err != nil {
		fmt.Printf("RmFileFromTodo - txn error: %v\nRmFileFromTodo - aborting txn\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func RmFileFromTodoAsync(
	ctx context.Context,
	todoID string,
	fileKey string,
	fileName string,
) error {
	fmt.Println("RmFileFromTodo called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.RemoveFileFromFromTodoCB(todoID, fileKey, fileName)
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

func DeleteBoardTxn(
	ctx context.Context,
	userID string,
	boardID string,
) error {
	fmt.Println("DeleteBoard called - transaction mode")

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
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
		},
	)

	if err != nil {
		fmt.Printf("DeleteBoard - txn error: %v\nDeleteBoard - aborting txn\n", err)
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

func (cbCtx CallbackContext) DeleteUserCB(userID string) error {
	usersColl := cbCtx.db.Collection(consts.UsersCollection)
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)
	userId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	if _, err = usersColl.DeleteOne(cbCtx.ctx, bson.M{"_id": userId}); err != nil {
		return err
	}

	userFilter := bson.M{"userId": userId}
	if _, err = todosColl.DeleteMany(cbCtx.ctx, userFilter); err != nil {
		return err
	}

	if _, err = boardsColl.DeleteMany(cbCtx.ctx, userFilter); err != nil {
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

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.DeleteUserCB(userID); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("DeleteUser - txn error: %v\nDeleteUser - aborting txn\n", err)
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

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.DeleteUserCB(userID)
}

/* -------------------------------------- Add todo to board --------------------------------------*/
// Set boardId on todo & add todo to board

func (cbCtx CallbackContext) AddTodoToBoardCB(
	todoID string,
	boardID string,
) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)

	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}
	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": boardID}}
	if _, err = todosColl.UpdateOne(cbCtx.ctx, todoFilter, todoUpdate); err != nil {
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

	if _, err = boardsColl.UpdateOne(cbCtx.ctx, boardFilter, boardUpdate); err != nil {
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

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.AddTodoToBoardCB(todoID, boardID); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("AddTodoToBoard - txn error: %v\nAddTodoToBoard - aborting txn\n", err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return abortErr
		} else {
			return err
		}
	}

	return nil
}

func AddTodoToBoardAsync(
	ctx context.Context,
	todoID string,
	boardID string,
) error {
	fmt.Println("AddTodoToBoard called - async mode")

	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return err
	}

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.AddTodoToBoardCB(todoID, boardID)
}

/* ------------------------------------ Remove todo from board ------------------------------------*/

func (cbCtx CallbackContext) RemoveTodoFromBoardCB(
	todoID string,
	boardID string,
) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}

	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": ""}}
	if _, err = todosColl.UpdateOne(cbCtx.ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)
	boardId, err := primitive.ObjectIDFromHex(boardID)
	if err != nil {
		return err
	}

	boardFilter := bson.M{"_id": boardId}
	boardUpdate := bson.M{"$pull": bson.M{
		"todoIds": todoID,
		"todos":   todoId,
	}}
	if _, err = boardsColl.UpdateOne(cbCtx.ctx, boardFilter, boardUpdate); err != nil {
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

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.RemoveTodoFromBoardCB(todoID, boardID); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("RemoveTodoFromBoard - txn error: %v\nRemoveTodoFromBoard - aborting txn\n", err)
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

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.RemoveTodoFromBoardCB(todoID, boardID)
}

/* ----------------------------------- Shift todo between boards -----------------------------------*/
// Remove todoId from fromBoard and add to toBoard at toIndex

func (cbCtx CallbackContext) ShiftTodoBetweenBoardsCB(
	todoID string,
	fromBoard string,
	toBoard string,
	toIndex int,
) error {
	todosColl := cbCtx.db.Collection(consts.TodosCollection)
	todoId, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return err
	}

	todoFilter := bson.M{"_id": todoId}
	todoUpdate := bson.M{"$set": bson.M{"boardId": toBoard}}
	if _, err = todosColl.UpdateOne(cbCtx.ctx, todoFilter, todoUpdate); err != nil {
		return err
	}

	boardsColl := cbCtx.db.Collection(consts.BoardsCollection)
	fromBoardId, err := primitive.ObjectIDFromHex(fromBoard)
	if err != nil {
		return err
	}
	fromBoardFilter := bson.M{"_id": fromBoardId}
	fromBoardUpdate := bson.M{"$pull": bson.M{
		"todos":   todoId,
		"todoIds": todoID,
	}}
	if _, err = boardsColl.UpdateOne(
		cbCtx.ctx,
		fromBoardFilter,
		fromBoardUpdate,
	); err != nil {
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

	if _, err = boardsColl.UpdateOne(
		cbCtx.ctx,
		toBoardFilter,
		toBoardUpdate,
	); err != nil {
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

	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			cbCtx := &CallbackContext{ctx: sessionContext, db: db}
			if err = cbCtx.ShiftTodoBetweenBoardsCB(todoID, fromBoard, toBoard, toIndex); err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			return nil
		},
	)

	if err != nil {
		fmt.Printf("ShiftTodoBetweenBoards - txn error: %v\nShiftTodoBetweenBoards - aborting txn\n", err)
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

	cbCtx := &CallbackContext{ctx: ctx, db: db}
	return cbCtx.ShiftTodoBetweenBoardsCB(todoID, fromBoard, toBoard, toIndex)
}

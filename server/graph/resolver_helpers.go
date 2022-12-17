package graph

import (
	"context"
	"fmt"
	"time"

	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/khengsaurus/ng-go-todos/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

/* ---------------------------------------- Delete user ----------------------------------------*/
// Delete a user's doc and all user's todos and boards

func DeleteUser[R bool](
	userID string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		userId, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			return false, err
		}

		usersColl := db.Collection(consts.UsersCollection)
		if _, err = usersColl.DeleteOne(ctx, bson.M{"_id": userId}); err != nil {
			return false, err
		}

		todosColl := db.Collection(consts.TodosCollection)
		userFilter := bson.M{"userId": userId}
		if _, err = todosColl.DeleteMany(ctx, userFilter); err != nil {
			return false, err
		}

		boardsColl := db.Collection(consts.BoardsCollection)
		if _, err = boardsColl.DeleteMany(ctx, userFilter); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* ---------------------------------------- Create board ----------------------------------------*/
// Create a new board and append its id to user's boardIds

func CreateBoard[R *model.Board](
	newBoard model.NewBoard,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		userId, err := primitive.ObjectIDFromHex(newBoard.UserID)
		if err != nil {
			return *new(R), err
		}

		boardsColl := db.Collection(consts.BoardsCollection)
		currTime := time.Now()
		boardDoc := bson.D{
			{Key: "userId", Value: userId},
			{Key: "name", Value: newBoard.Name},
			{Key: "todos", Value: []*model.Todo{}},
			{Key: "todoIds", Value: []*string{}},
			{Key: "color", Value: newBoard.Color},
			{Key: "createdAt", Value: currTime},
			{Key: "updatedAt", Value: currTime},
		}
		result, err := boardsColl.InsertOne(ctx, boardDoc)
		if err != nil {
			return *new(R), err
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
				Color:   newBoard.Color,
				Todos:   []*model.Todo{},
				TodoIds: []*string{},
			}
		} else {
			return *new(R), fmt.Errorf("CreateBoard mode - error creating document")
		}

		usersColl := db.Collection(consts.UsersCollection)
		userFilter := bson.M{"_id": userId}
		userUpdate := bson.M{"$push": bson.M{"boardIds": boardId}}
		if _, err = usersColl.UpdateOne(ctx, userFilter, userUpdate); err != nil {
			return *new(R), err
		}

		return board, nil
	}
}

/* ---------------------------------------- Delete board ----------------------------------------*/

func DeleteBoard[R bool](
	userID string,
	boardID string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		// Delete board
		boardsColl := db.Collection(consts.BoardsCollection)
		boardId, err := primitive.ObjectIDFromHex(boardID)
		if err != nil {
			return false, err
		}
		if _, err = boardsColl.DeleteOne(ctx, bson.M{"_id": boardId}); err != nil {
			return false, err
		}

		// Delete board from user
		usersColl := db.Collection(consts.UsersCollection)
		userId, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			return false, err
		}
		userFilter := bson.M{"_id": userId}
		userUpdate := bson.M{"$pull": bson.M{"boardIds": boardID}}
		if _, err = usersColl.UpdateOne(ctx, userFilter, userUpdate); err != nil {
			return false, err
		}

		// Delete board from any todos' boardId
		todosColl := db.Collection(consts.TodosCollection)
		todosFilter := bson.M{"boardId": boardID}
		todosUpdate := bson.M{"$set": bson.M{"boardId": ""}}
		if _, err = todosColl.UpdateMany(ctx, todosFilter, todosUpdate); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* -------------------------------------- Add file to todo --------------------------------------*/

func AddFileToTodo[R bool](
	todoID string,
	fileKey string,
	fileName string,
	uploaded string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		todosColl := db.Collection(consts.TodosCollection)
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
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
		if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* ------------------------------------ Remove file from todo ------------------------------------*/

func RmFileFromFromTodo[R bool](
	todoID string,
	fileKey string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		todosColl := db.Collection(consts.TodosCollection)
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
		}

		todoFilter := bson.M{"_id": todoId}
		todoUpdate := bson.M{"$pull": bson.M{"files": bson.M{"key": fileKey}}}
		if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* ---------------------------------------- Delete todo ----------------------------------------*/

func DeleteTodo[R bool](
	userID string,
	todoID string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		// Delete todo
		todosColl := db.Collection(consts.TodosCollection)
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
		}
		if _, err = todosColl.DeleteOne(ctx, bson.M{"_id": todoId}); err != nil {
			return false, err
		}

		// Delete todo from boards by user
		boardsColl := db.Collection(consts.BoardsCollection)
		userId, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			return false, err
		}
		filter := bson.M{"userId": userId}
		update := bson.M{"$pull": bson.M{
			"todos":   todoId,
			"todoIds": todoID,
		}}
		if _, err = boardsColl.UpdateMany(ctx, filter, update); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* -------------------------------------- Add todo to board --------------------------------------*/
// Set boardId on todo & add todo to board

func AddTodoToBoard[R bool](
	todoID string,
	boardID string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
		}

		todosColl := db.Collection(consts.TodosCollection)
		todoFilter := bson.M{"_id": todoId}
		todoUpdate := bson.M{"$set": bson.M{"boardId": boardID}}
		if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
			return false, err
		}

		boardId, err := primitive.ObjectIDFromHex(boardID)
		if err != nil {
			return false, err
		}

		boardsColl := db.Collection(consts.BoardsCollection)
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
			return false, err
		}

		return true, nil
	}
}

/* ------------------------------------ Remove todo from board ------------------------------------*/

func RmTodoFromBoard[R bool](
	todoID string,
	boardID string,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
		}

		todosColl := db.Collection(consts.TodosCollection)
		todoFilter := bson.M{"_id": todoId}
		todoUpdate := bson.M{"$set": bson.M{"boardId": ""}}
		if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
			return false, err
		}

		boardId, err := primitive.ObjectIDFromHex(boardID)
		if err != nil {
			return false, err
		}

		boardsColl := db.Collection(consts.BoardsCollection)
		boardFilter := bson.M{"_id": boardId}
		boardUpdate := bson.M{"$pull": bson.M{
			"todoIds": todoID,
			"todos":   todoId,
		}}
		if _, err = boardsColl.UpdateOne(ctx, boardFilter, boardUpdate); err != nil {
			return false, err
		}

		return true, nil
	}
}

/* ----------------------------------- Shift todo between boards -----------------------------------*/
// Remove todoId from fromBoard and add to toBoard at toIndex

func MoveTodoBwBoards[R bool](
	todoID string,
	fromBoard string,
	toBoard string,
	toIndex int,
) callback[R] {
	return func(
		ctx context.Context,
		db mongo.Database,
	) (R, error) {
		todoId, err := primitive.ObjectIDFromHex(todoID)
		if err != nil {
			return false, err
		}

		todosColl := db.Collection(consts.TodosCollection)
		todoFilter := bson.M{"_id": todoId}
		todoUpdate := bson.M{"$set": bson.M{"boardId": toBoard}}
		if _, err = todosColl.UpdateOne(ctx, todoFilter, todoUpdate); err != nil {
			return false, err
		}

		boardsColl := db.Collection(consts.BoardsCollection)

		// Todo is being moved from a board
		if fromBoard != "" {
			fromBoardId, err := primitive.ObjectIDFromHex(fromBoard)
			if err != nil {
				return false, err
			}

			fromBoardFilter := bson.M{"_id": fromBoardId}
			fromBoardUpdate := bson.M{"$pull": bson.M{
				"todos":   todoId,
				"todoIds": todoID,
			}}
			if _, err = boardsColl.UpdateOne(
				ctx,
				fromBoardFilter,
				fromBoardUpdate,
			); err != nil {
				return false, err
			}
		}

		toBoardId, err := primitive.ObjectIDFromHex(toBoard)
		if err != nil {
			return false, err
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
			ctx,
			toBoardFilter,
			toBoardUpdate,
		); err != nil {
			return false, err
		}

		return true, nil
	}
}

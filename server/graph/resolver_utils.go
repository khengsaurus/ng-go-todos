package graph

import (
	"context"
	"fmt"

	"github.com/khengsaurus/ng-go-todos/database"
	"github.com/khengsaurus/ng-go-todos/graph/model"
	"go.mongodb.org/mongo-driver/mongo"
)

type rv interface {
	bool | *model.Board | *model.Todo
}
type callback[R rv] func(ctx context.Context, db mongo.Database) (R, error)

func WithTransaction[R rv](
	ctx context.Context,
	cb callback[R],
	cbName string,
	fallbackValue R,
) (R, error) {
	fmt.Printf("WithTransaction - %s\n", cbName)

	session, db, err := database.GetSession(ctx)
	if err != nil {
		return fallbackValue, err
	}
	defer session.EndSession(ctx)

	var returnValue R
	err = mongo.WithSession(
		ctx, session,
		func(sessionContext mongo.SessionContext) error {
			if err = session.StartTransaction(database.GetTxnSessionConfig()); err != nil {
				return err
			}
			val, err := cb(ctx, *db)
			if err != nil {
				return err
			}
			if err = session.CommitTransaction(sessionContext); err != nil {
				return err
			}
			returnValue = val
			return nil
		})

	if err != nil {
		fmt.Printf("WithTransaction  - transaction error (%s): %v\nAborting transaction\n", cbName, err)
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			return fallbackValue, abortErr
		} else {
			return fallbackValue, err
		}
	}

	return returnValue, nil
}

func AsAsync[R rv](
	ctx context.Context,
	cb callback[R],
	cbName string,
	fallbackValue R,
) (R, error) {
	fmt.Printf("AsAsync - %s\n", cbName)
	db, err := database.GetMongoDb(ctx)
	if err != nil {
		return fallbackValue, err
	}
	return cb(ctx, *db)
}

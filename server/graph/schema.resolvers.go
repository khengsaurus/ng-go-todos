package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/khengsaurus/ng-gql-todos/graph/generated"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"github.com/khengsaurus/ng-gql-todos/store"
)

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, input model.NewUser) (*model.User, error) {
	db := store.GetStoreFromContext(ctx)
	user, err := db.AddUser(&input)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// CreateTodo is the resolver for the createTodo field.
func (r *mutationResolver) CreateTodo(ctx context.Context, input model.NewTodo) (*model.Todo, error) {
	db := store.GetStoreFromContext(ctx)
	newTodo, err := db.AddTodo(&input)
	if err != nil {
		return nil, err
	}

	return newTodo, nil
}

// Todos is the resolver for the todos field.
func (r *queryResolver) Todos(ctx context.Context, userID string) ([]*model.Todo, error) {
	db := store.GetStoreFromContext(ctx)
	todos := make([]*model.Todo, 0)
	for _, _todo := range db.Todos {
		if _todo.UserID == userID {
			todos = append(todos, _todo)
		}
	}

	return todos, nil
}

// Todo is the resolver for the todo field.
func (r *queryResolver) Todo(ctx context.Context, userID string, todoID string) (*model.Todo, error) {
	db := store.GetStoreFromContext(ctx)
	for _, todo := range db.Todos {
		if todo.ID == todoID && todo.UserID == userID {
			return todo, nil
		}
	}

	return nil, nil
}

// Users is the resolver for the users field.
func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	db := store.GetStoreFromContext(ctx)
	return db.Users, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

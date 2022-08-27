package store

import (
	"context"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
)

type Store struct {
	Todos []*model.Todo
	Users []*model.User
}

type StoreKeyType string

var (
	StoreKey StoreKeyType = "STORE"
)

func NewStore() *Store {
	users := make([]*model.User, 0)
	todos := make([]*model.Todo, 0)

	return &Store{Todos: todos, Users: users}
}

// WithStore middleware - inect store into context
func WithStore(store *Store, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Add store to context
		reqWithStore := r.WithContext(context.WithValue(r.Context(), StoreKey, store))
		next.ServeHTTP(w, reqWithStore)
	})
}

// GetStoreFromContext - retrieves store from request context
func GetStoreFromContext(ctx context.Context) *Store {
	store, ok := ctx.Value(StoreKey).(*Store)
	if !ok {
		panic("Couldn't find STORE in context")
	}
	return store
}

func (s *Store) AddUser(input *model.NewUser) (*model.User, error) {
	newUser := &model.User{
		ID:   uuid.NewString(),
		Name: input.Name,
	}
	s.Users = append(s.Users, newUser)
	return newUser, nil
}

func (s *Store) AddTodo(input *model.NewTodo) (*model.Todo, error) {
	var user *model.User
	for _, _user := range s.Users {
		if _user.ID == input.UserID {
			user = _user
			break
		}
	}
	if user == nil {
		return nil, errors.New("no user with that ID")
	}
	newTodo := &model.Todo{
		ID:     uuid.NewString(),
		Text:   input.Text,
		UserID: input.UserID,
		Done:   false,
	}
	s.Todos = append(s.Todos, newTodo)
	return newTodo, nil
}

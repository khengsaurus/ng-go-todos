// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"time"
)

type Board struct {
	ID        string    `json:"id" bson:"_id"`
	UserID    string    `json:"userId" bson:"userId"`
	Name      string    `json:"name" bson:"name"`
	Todos     []*Todo   `json:"todos" bson:"todos"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

type NewBoard struct {
	UserID  string    `json:"userId" bson:"userId"`
	Name    string    `json:"name" bson:"name"`
	TodoIds []*string `json:"todoIds" bson:"todoIds"`
}

type NewTodo struct {
	Text   string `json:"text" bson:"text"`
	UserID string `json:"userId" bson:"userId"`
}

type NewUser struct {
	Email    string  `json:"email" bson:"email"`
	Username *string `json:"username" bson:"username"`
}

type Todo struct {
	ID        string    `json:"id" bson:"_id"`
	UserID    string    `json:"userId" bson:"userId"`
	Text      string    `json:"text" bson:"text"`
	Done      bool      `json:"done" bson:"done"`
	Priority  int       `json:"priority" bson:"priority"`
	Tag       string    `json:"tag" bson:"tag"`
	BoardID   string    `json:"boardId" bson:"boardId"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

type UpdateBoard struct {
	ID     string    `json:"id" bson:"_id"`
	UserID string    `json:"userId" bson:"userId"`
	Name   string    `json:"name" bson:"name"`
	Todos  []*string `json:"todos" bson:"todos"`
}

type UpdateTodo struct {
	ID       string  `json:"id" bson:"_id"`
	UserID   string  `json:"userId" bson:"userId"`
	Text     *string `json:"text" bson:"text"`
	Done     *bool   `json:"done" bson:"done"`
	Priority *int    `json:"priority" bson:"priority"`
	Tag      *string `json:"tag" bson:"tag"`
	BoardID  *string `json:"boardId" bson:"boardId"`
}

type User struct {
	ID       string  `json:"id" bson:"_id"`
	Username string  `json:"username" bson:"username"`
	Email    *string `json:"email" bson:"email"`
}

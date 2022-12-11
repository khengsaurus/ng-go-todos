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
	TodoIds   []*string `json:"todoIds" bson:"todoIds"`
	Color     string    `json:"color" bson:"color"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

type File struct {
	Key      string `json:"key" bson:"key"`
	Name     string `json:"name" bson:"name"`
	Uploaded string `json:"uploaded" bson:"uploaded"`
}

type GetBoardsRes struct {
	Boards []*Board `json:"boards" bson:"boards"`
	Cache  bool     `json:"cache" bson:"cache"`
}

type GetTodosRes struct {
	Todos []*Todo `json:"todos" bson:"todos"`
	Cache bool    `json:"cache" bson:"cache"`
}

type NewBoard struct {
	UserID string `json:"userId" bson:"userId"`
	Name   string `json:"name" bson:"name"`
	Color  string `json:"color" bson:"color"`
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
	BoardID   string    `json:"boardId" bson:"boardId"`
	Text      string    `json:"text" bson:"text"`
	Priority  int       `json:"priority" bson:"priority"`
	Markdown  bool      `json:"markdown" bson:"markdown"`
	Done      bool      `json:"done" bson:"done"`
	Files     []*File   `json:"files" bson:"files"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

type UpdateBoard struct {
	ID     string    `json:"id" bson:"_id"`
	UserID string    `json:"userId" bson:"userId"`
	Name   *string   `json:"name" bson:"name"`
	Color  *string   `json:"color" bson:"color"`
	Todos  []*string `json:"todos" bson:"todos"`
}

type UpdateTodo struct {
	ID       string  `json:"id" bson:"_id"`
	UserID   string  `json:"userId" bson:"userId"`
	BoardID  *string `json:"boardId" bson:"boardId"`
	Text     *string `json:"text" bson:"text"`
	Priority *int    `json:"priority" bson:"priority"`
	Markdown *bool   `json:"markdown" bson:"markdown"`
	Done     *bool   `json:"done" bson:"done"`
}

type User struct {
	ID       string    `json:"id" bson:"_id"`
	Username string    `json:"username" bson:"username"`
	Email    *string   `json:"email" bson:"email"`
	BoardIds []*string `json:"boardIds" bson:"boardIds"`
}

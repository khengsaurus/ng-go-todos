package model

import "sort"

func (board *Board) OrderTodos() {
	if len(board.TodoIds) == 0 {
		return
	}
	todoIndexes := make(map[string]int)
	for i, todoId := range board.TodoIds {
		todoIndexes[*todoId] = i
	}
	sort.Slice(board.Todos, func(i, j int) bool {
		return todoIndexes[board.Todos[i].ID] < todoIndexes[board.Todos[j].ID]
	})
}

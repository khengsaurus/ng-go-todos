package utils

import (
	"fmt"
)

func GetUserTodosKey(userId string) string {
	return fmt.Sprintf("%s-todos", userId)
}

func GetUserBoardsKey(userId string) string {
	return fmt.Sprintf("%s-boards", userId)
}

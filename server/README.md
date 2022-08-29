### Sample queries

```gql
query getUsers {
  getUsers {
    username
    id
  }
}

mutation createUser($newUser: NewUser!) {
  createUser(newUser: $newUser) {
    username
    id
  }
}

query getTodos($userId: String!) {
  getTodos(userId: $userId) {
    text
    userId
    id
  }
}

query getTodo($todoId: String!) {
  getTodo(todoId: $todoId) {
    text
  }
}

mutation createTodo($newTodo: NewTodo!) {
  createTodo(newTodo: $newTodo) {
    id
    text
    userId
  }
}

mutation updateTodo($updateTodo: UpdateTodo!) {
  updateTodo(updateTodo: $updateTodo) {
    text
    priority
    tag
    done
  }
}

mutation deleteTodo($todoId: String!) {
  deleteTodo(todoId: $todoId)
}
```

Variables for createUser & createTodo

```json
{
  "userId": "630b894f0006a7c19851aacd",
  "todoId": "630b748f1db5dad99438895f",
  "newUser": {
    "username": "user-3"
  },
  "newTodo": {
    "userId": "630b40ec107712837bff76ae",
    "text": "user-1-todo-2"
  },
  "updateTodo": {
    "id": "630b748f1db5dad99438895f",
    "userId": "630b894f0006a7c19851aacd",
    "text": "user-2 from user-1",
    "tag": "white",
    "priority": 2,
    "done": false
  }
}
```

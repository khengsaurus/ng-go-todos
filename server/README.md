### Sample queries

```gql
query getUsers {
  getUsers {
    username
    email
    id
  }
}

query getUser($email: String!) {
  getUser(email: $email) {
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

mutation deleteUser($userId: String!) {
  deleteUser(userId: $userId)
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

Request variables

```json
{
  "userId": "",
  "todoId": "",
  "email": "",
  "newUser": {
    "email": "",
    "username": ""
  },
  "newTodo": {
    "userId": "",
    "text": ""
  },
  "updateTodo": {
    "id": "",
    "userId": "",
    "text": "",
    "tag": "white",
    "priority": 2,
    "done": false
  }
}
```

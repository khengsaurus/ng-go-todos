### gqlgen

```bash
go run github.com/99designs/gqlgen && go run tools/bson_generate.go
```
NB: Running this after schema changes may result in gqlgen failing and bson_generate not being executed. Resolve the issues in `schema.resolvers.go` and run again to generate bson tags.

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

query getTodos($userId: String!, $fresh: Boolean!) {
  getTodos(userId: $userId, fresh: $fresh) {
    text
    userId
    id
    createdAt
    updatedAt
  }
}

query getTodo($todoId: String!) {
  getTodo(todoId: $todoId) {
    text
    createdAt
    updatedAt
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

mutation deleteTodo($userId: String!, $todoId: String!) {
  deleteTodo(userId: $userId, todoId: $todoId)
}
```

Request variables

```json
{
  "userId": "",
  "todoId": "",
  "email": "",
  "fresh": false,
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
    "tag": "",
    "priority": 2,
    "done": false
  }
}
```

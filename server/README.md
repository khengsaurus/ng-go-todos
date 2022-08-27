### Sample queries

```gql
query getUsers {
  users {
    name
    id
  }
}

mutation createUser($name: String!) {
  createUser(input: {name: $name}) {
    id
  }
}

query getTodos($userId: String!) {
  todos(userId: $userId) {
    text
    userId
    id
  }
}

query getTodo($userId: String!, $todoId: String!) {
  todo(userId: $userId, todoId: $todoId) {
    text
  }
}

mutation createTodo($input: NewTodo!) {
  createTodo(input: $input) {
    id
    text
    userId
  }
}
```

Variables for createUser & createTodo

```json
{
  "name": "user-1",
  "userId": "generated_user_id",
  "todoId": "generated_todo_id",
  "input":{
    "text": "todo-1",
    "userId": "generated_user_id"
  }
}
```

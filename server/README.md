# Server

## Running with Docker

```bash
# Run as foreground process:
> docker compose down && docker compose up

# Init LocalStack S3:
> python3 scripts/ls_s3_create_bucket.py

# Run as background process and init LocalStack S3:
> bash scripts/init_dev.sh
```

<hr/>

## Sample queries

Access the server's GraphQL playground at `<host>:<port>/playground`

```gql
mutation createUser($newUser: NewUser!) {
  createUser(newUser: $newUser) {
    username
    id
  }
}

query getUsers {
  getUsers {
    username
    email
    id
    boardIds
  }
}

query getUser($email: String!) {
  getUser(email: $email) {
    username
    id
    boardIds
  }
}

mutation deleteUser($userId: String!) {
  deleteUser(userId: $userId)
}

mutation createTodo($newTodo: NewTodo!) {
  createTodo(newTodo: $newTodo) {
    id
    text
    userId
  }
}

query getTodos($userId: String!, $fresh: Boolean!) {
  getTodos(userId: $userId, fresh: $fresh) {
    cache
    todos {
      text
      id
      boardId
      markdown
      done
      files {
        key
      }
    }
  }
}

query getTodo($todoId: String!) {
  getTodo(todoId: $todoId) {
    userId
    id
    text
    boardId
    markdown
    done
    createdAt
    updatedAt
    files {
      key
    }
  }
}

mutation updateTodo($updateTodo: UpdateTodo!) {
  updateTodo(updateTodo: $updateTodo)
}

mutation deleteTodo($userId: String!, $todoId: String!) {
  deleteTodo(userId: $userId, todoId: $todoId)
}

mutation createBoard($newBoard: NewBoard!) {
  createBoard(newBoard: $newBoard) {
    id
    name
    userId
  }
}

query getBoard($boardId: String!) {
  getBoard(boardId: $boardId) {
    id
    userId
    name
    color
    todos {
      id
      text
    }
  }
}

query getBoards($userId: String!) {
  getBoards(userId: $userId, fresh: true) {
    cache
    boards {
      id
      color
      todos {
        id
        text
      }
      todoIds
    }
  }
}

mutation deleteBoard($userId: String!, $boardId: String!) {
  deleteBoard(userId: $userId, boardId: $boardId)
}

mutation addRmBoardTodo(
  $userId: String!
  $boardId: String!
  $todoId: String!
  $rm: Boolean!
) {
  addRmBoardTodo(userId: $userId, boardId: $boardId, todoId: $todoId, rm: $rm)
}

mutation rmTodoFiles($todoId: String!) {
  rmTodoFiles(todoId: $todoId)
}
```

Request variables

```json
{
  "userId": "",
  "todoId": "",
  "boardId": "",
  "email": "",
  "fresh": true,
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
    "boardId": "",
    "text": "",
    "priority": 2,
    "markdown": true,
    "done": false
  },
  "newBoard": {
    "userId": "",
    "name": "",
    "color": ""
  }
}
```

<hr/>

## gqlgen

[99designs/gqlgen](https://github.com/99designs/gqlgen) is used to generate much of the boilerplate required for a Go GraphQL server. BSON tags are then generated manually using this [script](https://github.com/99designs/gqlgen/issues/865#issuecomment-573043996).

```bash
go run github.com/99designs/gqlgen && go run tools/bson_generate.go
```

NB: Running this after schema changes may result in gqlgen failing and bson_generate not being executed. Resolve the issues in `graph/schema.resolvers.go` and run again to generate bson tags.

<hr/>

## LocalStack commands

Install the [LocalStack AWS CLI](https://github.com/localstack/awscli-local)

```bash
# List LS S3 buckets
> awslocal s3 ls

# List LS S3 bucket contents
> awslocal s3 ls <bucket-name> --recursive

# Cleanup LS S3
> bash scripts/ls_s3_cleanup.sh
```

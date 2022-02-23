var ApiBuilder = require('claudia-api-builder'),
  api = new ApiBuilder()

module.exports = api

api.post('/hello', function (event) {
  return new api.ApiResponse(
    `
      <html>
        <head>
          <title>My First Claudia.js Project</title>
        </head>
        <body>
          <h1>Hello ${event.post.name}</h1>
        </body>
      </html>
    `,
    {
      'Content-Type': 'text/html',
    }
  )
})

api.get('/', function () {
  return new api.ApiResponse(
    `
      <html>
        <head>
          <title>My First Claudia.js Project</title>
        </head>
        <body>
          <h1>Say Hello</h1>
          <form action="/latest/hello" method="POST">
            <label>What is your name?</label>
            <input type="text" name="name" />
            <input type="submit" value="Say Hello" />
          </form>
        </body>
      </html>
    `,
    {
      'Content-Type': 'text/html',
    }
  )
})

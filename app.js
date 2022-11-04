const express = require('express')
const cors = require('cors')
const uploader = require('express-fileupload')
const { extname, resolve } = require('path')
const {
  promises: {
    writeFile,
    appendFile,
  },
  existsSync,
} = require('fs')

const app = express()
const port = 8080

app.use(express.json())
app.use(express.urlencoded({ urlencoded: true }))



app.use(cors())
app.use(uploader())
app.use('/public', express.static('public'))

app.post('/api/upload', async (req, res) => {
  const { name, size, type, offset, hash } = req.body
  const { file } = req.files
  console.log(name, size, type, offset, hash)

  const ext = extname(name)
  const filename = resolve(__dirname, `./public/${hash}${ext}`)
  if (offset > 0) {
    if (!existsSync(filename)) {
      res.status(400)
        .send({
          message: '文件不存在',
        })
      return
    }

    await appendFile(filename, file.data)
    res.send({
      data: 'appended',
    })
    return
  }

  await writeFile(filename, file.data)
  res.send({
    data: 'created',
  })
})

app.listen(port, () => {
  console.log('Server is running at:', port)
})

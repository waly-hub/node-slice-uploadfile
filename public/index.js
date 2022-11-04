const uploader = document.getElementById('uploader')
const output = document.getElementById('output')
const progress = document.getElementById('progress')

function read (file) {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = reject

    reader.readAsBinaryString(file)
  })
}

uploader.addEventListener('change', async (event) => {
  const { files } = event.target
  const [file] = files
  if (!file) {
    return
  }
  uploader.value = null
  const content = await read(file)
  // 根据文件内容计算md5
  const hash = CryptoJS.MD5(content)
  const { size, name, type } = file
  progress.max = size
  // 切片大小
  const chunkSize = 64 * 1024
  // 已上传内容
  let uploaded = 0
  // 存放到local
  const local = localStorage.getItem(hash)
  if (local) {
    uploaded = Number(local)
  }
  while (uploaded < size) {
    // 切片内容
    const chunk = file.slice(uploaded, uploaded + chunkSize, type)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('type', type)
    formData.append('size', size)
    formData.append('file', chunk)
    formData.append('hash', hash)
    formData.append('offset', uploaded)

    try {
      await axios.post('http://localhost:8080/api/upload', formData)
    } catch (e) {
      output.innerText = '上传失败。' + e.message
      return
    }

    uploaded += chunk.size
    localStorage.setItem(hash, uploaded)
    progress.value = uploaded
  }

  output.innerText = '上传成功。'
})

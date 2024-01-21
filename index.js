// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import stream from 'node:stream'
import { pipeline } from 'node:stream/promises'

// TODO
// 簡易 stream read -> gz (node:zlib) -> write 演示
// [OK] Handle Error, onError remove saved file
// 嘗試 crypto
// web 版 ReadableStream, TransformStream, WritableStream

const filePath = path.join(process.cwd(), '/public/test.txt')
const savePath = path.join(process.cwd(), '/public/test2.txt')

const readStream = fs.createReadStream(filePath, {
  highWaterMark: 1, // read 1 bytes
})

const transform = new stream.Transform({
  transform(chunk, encoding, cb) {
    console.log({ chunk, encoding })

    // add 1 to chunk
    try {
      /** @type {Buffer} */
      const buf = chunk
      const stringNum = buf.toString()
      const num = +stringNum + 1
      this.push(Buffer.from(num)) // will throw error
      cb()
    } catch (err) {
      cb(err)
    }
  }
})

const writeStream = fs.createWriteStream(savePath)

// 只需寫一個 onError 的 pipe
try {
  await pipeline(
    readStream,
    transform,
    writeStream,
  )
} catch (err) {
  console.log('[Error]', err.message)
  writeStream.close(() => {
    fs.unlinkSync(savePath)
  })
}

// 需要在每個 stream 都寫 onError 的 pipe
// readStream
//   .pipe(transform)
//   .on('error', (err) => {
//     console.log('[Error]', err.message)
//   })
//   .pipe(fs.createWriteStream(savePath))

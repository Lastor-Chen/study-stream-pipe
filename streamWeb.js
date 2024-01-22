// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import { ReadableStream, TransformStream } from 'node:stream/web'

// import stream/web 跟直接抓 global 的 type 不一樣

const filePath = path.join(process.cwd(), '/public/test.txt')
const savePath = path.join(process.cwd(), '/public/test2.txt')

const readStream = fs.createReadStream(filePath, {
  highWaterMark: 1, // read 1 bytes
})

const readableStream = new ReadableStream({
  /** @param {ReadableStreamDefaultController} controller  */
  async start(controller) {
    console.log('read start')
    for await (const chunk of readStream) {
      console.log('read', chunk)
      // get the data and send it to the browser via the controller
      controller.enqueue(chunk)
    }

    // there is no more data to read
    console.log('close')
    controller.close()
  },
})

const transform = new TransformStream({
  start() {},
  /** @param {Buffer} chunk  */
  async transform(chunk, controller) {
    console.log('transform')
    const stringNum = chunk.toString()
    const num = +stringNum + 1
    // controller.enqueue(Buffer.from(num)) // will throw error
    controller.enqueue(Buffer.from(num.toString())) // will throw error
  },
})

// const writeStream = fs.createWriteStream(savePath)

console.log('start')

/**
 * @see {@link [pipeTo](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeTo)}
 */
const streamPipe = readableStream
  .pipeThrough(transform)
  // 最後一個 pipe 時使用, 會拿到一個 Promise, 如果前面的 pipe 失敗就不會執行
  // .pipeTo()

// 要跑這段 pipeThrough 才會被觸發
for await (const chunk of streamPipe) {
  console.log('read stream', chunk)
}

console.log('done')

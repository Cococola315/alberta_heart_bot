// This script was last ran on 2025-12-26

require('dotenv').config()
const { OpenAI } = require('openai')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const { PDFParse } = require('pdf-parse')
const mammoth = require('mammoth')

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
})

const ROOT_DIR = ""

// deletes file after upload
const deleteFile = async (fileName) => {
  try {
    await fs.promises.unlink(fileName)
    console.log(`Deleted file: ${fileName}`)
  } catch (err) {
    console.error(`Error deleting file ${fileName}:`, err)
  }
}

// upload file to vector store
const uploadToVectorStore = async (jsonFileName) => {
  const file = await openai.files.create({
    file: fs.createReadStream(jsonFileName),
    purpose: 'assistants',
  })

  await openai.vectorStores.files.create(
    process.env.VECTOR_STORE_ID,
    { file_id: file.id }
  )
}

// creates a json file 
const createJsonFile = async (data, metadata) => {
  // creates json object
  const jsonContent = {
    ...metadata,
    content: data
  }
  const jsonString = JSON.stringify(jsonContent)
  console.log(jsonString)

  // create json file with randomized name (we can actually use more detailed names relating to the file)
  const filename = `${crypto.randomUUID()}.json`
  await fs.promises.writeFile(filename, jsonString, 'utf8')

  return filename
}

// get metadata from file 
const getMetadata = (filePath) => {
  return { 
    name: path.basename(filePath),
    relativePath: path.relative(ROOT_DIR, filePath)
  }
}

// get text out of files since pdfs and docxs are just containers
// uploads the files to vector store
// deletes the temporary json file after upload
const processFilesAndUpload = async (filePath, ext) => { 
  if (ext === '.pdf') {
    const dataBuffer = await fs.promises.readFile(filePath)
    const parser = new PDFParse({ data: dataBuffer })
    const data = await parser.getText()
    const metadata = getMetadata(filePath)
    const jsonFileName = await createJsonFile(data.text, metadata)
    await uploadToVectorStore(jsonFileName)
    await deleteFile(jsonFileName)
  } 
  else if (ext === '.docx') {
    const data = await mammoth.extractRawText({ path: filePath })
    const metadata = getMetadata(filePath)
    const jsonFileName = await createJsonFile(data.value, metadata)
    await uploadToVectorStore(jsonFileName)
    await deleteFile(jsonFileName)
  }
}

const navigateFolders = async (folderPath) => {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true })
  
  // go into every subfolger
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name)

    // if the entry is a folder, navigate into it recursively
    if (entry.isDirectory()) {
      await navigateFolders(fullPath)
    } 
    else { 
      const ext = path.extname(entry.name).toLowerCase()

      // check for supported file types
      if (ext === '.docx' || ext === '.pdf' || ext === '.txt') {
        await processFilesAndUpload(fullPath, ext)
      }
    }
  }
}

const main = async () => {
  navigateFolders(ROOT_DIR)
}

main()
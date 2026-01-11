require('dotenv').config()
const { OpenAI } = require('openai')

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
})

const main = async () => {
  const vs = openai.vectorStores.create({
    name: "ABH Info",
    description: "Contains all Alberta Heart Bot information"
  })

  console.log(vs)
}

main()
require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
})

const request = async (question) => {
  const response = await openai.responses.create({
    model: 'gpt-4o',
    input: question
  })

  return response
}

module.exports = {
  request
}
const { SlashCommandBuilder } = require('discord.js')
const { request } = require('../../util/openai')
const MODEL_INPUT_COST_PER_1M_TOKENS = 0.25 / 1000000 // $0.25 per 1M tokens for gpt-5-mini input
const MODEL_OUTPUT_COST_PER_1M_TOKENS = 2.00 / 1000000 // $2.00 per 1M tokens for gpt-5-mini output

// command data for the ask command
const data = new SlashCommandBuilder()
	.setName('ask')
	.setDescription('Ask the Alberta Heart Bot a question!')
	.addStringOption(option =>
		option
			.setName('question')
			.setDescription('The question you want to ask')
			.setRequired(true)
			.setMaxLength(2000)
	)

// function that runs when the command is called
const askCommand = async (interaction) => {
  // lets us edit the response because openai takes arbitrary time
  await interaction.deferReply()

  try {
    // make the request to openai and get the response
    const question = interaction.options.getString('question')
    const response = await request(question)
    console.log(response)
    console.log('Used tokens:', response.usage.total_tokens)
    console.log('Total cost: $', 
                ((MODEL_INPUT_COST_PER_1M_TOKENS * response.usage.input_tokens) 
                + (MODEL_OUTPUT_COST_PER_1M_TOKENS * response.usage.output_tokens))
                .toFixed(6))
    await interaction.editReply(question + '\n\n' + response.output_text)
  } catch (error) {
    // log the error and inform the user
    console.error('openai error: ', error)
    await interaction.editReply('Sorry, there was an error processing your request.')
  }
}

module.exports = {
  data,
  execute: askCommand
}
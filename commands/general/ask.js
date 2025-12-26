const { SlashCommandBuilder } = require('discord.js')
const { request } = require('../../util/openai')

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
    await interaction.editReply(response.output_text)
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
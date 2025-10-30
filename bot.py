import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
from openai import OpenAI
import requests

# Load keys
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
CHATGPT_API_KEY = os.getenv("CHATGPT_API_KEY")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

# Setup instance of OpenAI client
client_ai = OpenAI(api_key=CHATGPT_API_KEY)

# Setup Discord client
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True  # required to read message text
bot = commands.Bot(command_prefix="!", intents=intents)

def send_to_webhook(message:str):
    payload = {
        "content": message,
        "username": "ChatGPT Logger"
    }
    requests.post(WEBHOOK_URL,json=payload)

@bot.event
async def on_ready():
    print(f"🤖 Logged in as {bot.user}")

@bot.command(name="ask")
async def ask(ctx, *, prompt: str):

    # Only respond in the allowed channel
    allowed_channel_id = 1418946574737866933

    if ctx.channel.id != allowed_channel_id:
        return # do nothing if the command was used outside allowed channel
    

    """Ask ChatGPT a question with !ask <question>"""
    await ctx.send("Thinking...")

    response = client_ai.chat.completions.create(
        model="gpt-4o-mini",  # or "gpt-4o", "gpt-5" if available
        messages=[
            {"role": "system", "content": "You are a helpful assistant in a Discord server."},
            {"role": "user", "content": prompt},
        ]
    )

    answer = response.choices[0].message.content
    await ctx.send(answer[:1900])  # Discord message limit is 2000 chars

    send_to_webhook(f"**{ctx.author} asked:** {prompt}\n**ChatGPT replied** {answer[:1900]}")

bot.run(DISCORD_TOKEN)
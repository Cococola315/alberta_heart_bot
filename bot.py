import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
from openai import OpenAI

# Load keys
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
CHATGPT_API_KEY = os.getenv("CHATGPT_API_KEY")

# Setup instance of OpenAI client
client_ai = OpenAI(api_key=CHATGPT_API_KEY)

# Setup Discord client
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True  # required to read message text
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"🤖 Logged in as {bot.user}")

@bot.command(name="ask")
async def ask(ctx, *, prompt: str):
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

bot.run(DISCORD_TOKEN)
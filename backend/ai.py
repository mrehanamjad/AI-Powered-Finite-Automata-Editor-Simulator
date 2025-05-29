# ai.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

# Initialize the Gemini model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)

# Template for prompt
TEMPLATE = """You are a regex generator bot for formal language theory.
Given a user's natural language description of a pattern, generate a valid regular expression using standard regex notation.
Only return the regex. Do NOT explain anything.
Description: {text}
Regex:?"""

def generate_regex_from_natural_language(text: str) -> str:
    """Use Gemini to convert natural language to regex"""
    prompt = TEMPLATE.format(text=text)
    response = llm.invoke(prompt)
    return response.content.strip()

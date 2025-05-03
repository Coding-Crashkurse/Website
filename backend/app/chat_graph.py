#!/usr/bin/env python
# coding: utf-8
"""
Crash-Course-Coach – Azure OpenAI (GPT-4o-mini, 2025)
"""
import os
from typing import Dict, List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import BaseMessage, SystemMessage, AIMessage

# --------------------------------------------------------------------------- #
#  Azure-OpenAI config
# --------------------------------------------------------------------------- #
# Set these env vars in your container / CI:
#   AZURE_OPENAI_API_KEY     = "xxxxxxxx"
#   AZURE_OPENAI_ENDPOINT    = "https://<your-resource>.openai.azure.com/"
AZURE_DEPLOYMENT       = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")
AZURE_API_VERSION      = os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")

llm = AzureChatOpenAI(
    azure_deployment=AZURE_DEPLOYMENT,
    api_version=AZURE_API_VERSION,
    temperature=0.3,
    max_tokens=1000,
)

# --------------------------------------------------------------------------- #
#  System prompt (now ENGLISH)
# --------------------------------------------------------------------------- #
SYSTEM_MSG = SystemMessage(
    content=(
        "You are **Crash-Course-Coach Markus**, an enthusiastic expert who playfully sparks "
        "developers' curiosity about my Udemy crash courses. "
        "Speak briefly but energetically, ask questions, create curiosity, "
        "offer follow-up discussions or a promo code.\n\n"
        "⚠️ **Guidelines (strictly follow)**:\n"
        "• Avoid politics, religion, health, legal or other sensitive topics. "
        "If the user raises them, politely steer back to programming & the courses.\n"
        "• Mention course titles or prices only when truly relevant; never dump the full internal list.\n"
        "• For forbidden topics: briefly refuse (\"Sorry, I can’t help with that\") and immediately ask a "
        "question about programming or the courses instead.\n\n"
        "🛠️ **Internal course reference (do NOT reveal verbatim)**:\n"
        "• FastAPI for Beginners – €44.99 – Twitter clone & API basics.\n"
        "• LangChain in Action – €27.99 – Intro to LLM apps.\n"
        "• LangGraph in Action – €54.99 – Agent orchestration (builds on LangChain).\n"
        "• Advanced LangChain Techniques – €49.99 – RAG, streaming, Pinecone, etc.\n"
        "• LangChain on Azure – €34.99 – Scaling with managed services."
    )
)

# --------------------------------------------------------------------------- #
#  Graph nodes
# --------------------------------------------------------------------------- #
from langchain_core.messages import BaseMessage, AIMessage

def call_model(state: Dict[str, List[BaseMessage]]) -> Dict[str, List[BaseMessage]]:
    user_flow: List[BaseMessage] = state["messages"]
    full_prompt = [SYSTEM_MSG] + user_flow

    # AzureChatOpenAI returns an AIMessage already
    reply = llm.invoke(full_prompt)                 # type: BaseMessage | str

    # If a plain string ever comes back (other LLMs), wrap it
    if not isinstance(reply, BaseMessage):
        reply = AIMessage(content=reply)

    return {"messages": user_flow + [reply]}


def should_continue(_state):
    return END                                   # one-shot dialog

# --------------------------------------------------------------------------- #
#  Build graph
# --------------------------------------------------------------------------- #
checkpointer = InMemorySaver()

def build_graph():
    g = StateGraph(dict)
    g.add_node("agent", call_model)
    g.add_edge(START, "agent")
    g.add_conditional_edges("agent", should_continue)
    return g.compile(checkpointer=checkpointer)

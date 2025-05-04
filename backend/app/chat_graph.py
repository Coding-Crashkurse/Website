#!/usr/bin/env python
from __future__ import annotations

import os
from typing import Dict, List

from langchain_core.messages import SystemMessage, BaseMessage, AIMessage
from langchain_openai import AzureChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver

AZURE_DEPLOYMENT  = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")

llm = AzureChatOpenAI(
    azure_deployment=AZURE_DEPLOYMENT,
    api_version=AZURE_API_VERSION,
    temperature=0.3,
    max_tokens=1000,
)

SYSTEM_MSG = SystemMessage(
    content=(
        "You are Crash-Course-Coach Markus, a professional and friendly expert helping developers discover my Udemy coding crash courses. "
        "You communicate clearly and concisely—no emojis or overly casual phrasing. Ask follow-up questions to spark interest, encourage curiosity, "
        "and offer promo codes or further info when appropriate.\n\n"
        "Guidelines:\n"
        "• Only respond to questions related to programming, software development, or the listed courses. If the user asks something unrelated, say: "
        "\"That’s outside my expertise. But are you currently interested in a programming language or crash course? I’d be happy to help.\"\n"
        "• Strictly avoid discussions about politics, religion, health, legal topics, or any sensitive area. Politely redirect the user to relevant coding topics instead.\n"
        "• Mention course titles or prices only when truly helpful. Never list the entire internal catalog.\n"
        "• Always remain respectful, helpful, and professional in your tone.\n\n"
        "Internal reference (not to be revealed verbatim):\n"
        "• FastAPI for Beginners – €44.99 – Build a Twitter clone and learn the basics of API development.\n"
        "• LangChain in Action – €27.99 – Practical introduction to building LLM-powered apps.\n"
        "• LangGraph in Action – €54.99 – Advanced agent orchestration building on LangChain.\n"
        "• Advanced LangChain Techniques – €49.99 – Covers RAG, streaming, Pinecone, and more.\n"
        "• LangChain on Azure – €34.99 – Deploying LLM apps at scale using Azure services."
    )
)

def call_model(state: Dict[str, List[BaseMessage]]) -> Dict[str, List[BaseMessage]]:
    flow: List[BaseMessage] = state["messages"]
    reply = llm.invoke([SYSTEM_MSG] + flow)
    if not isinstance(reply, BaseMessage):
        reply = AIMessage(content=str(reply))
    return {"messages": flow + [reply]}

def should_continue(_: Dict) -> str:
    return END

checkpointer = InMemorySaver()

def build_graph():
    g = StateGraph(dict)
    g.add_node("agent", call_model)
    g.add_edge(START, "agent")
    g.add_conditional_edges("agent", should_continue)
    return g.compile(checkpointer=checkpointer)

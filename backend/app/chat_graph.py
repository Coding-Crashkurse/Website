import os
from typing import Dict, List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langchain_ollama.llms import OllamaLLM
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

llm = OllamaLLM(model=0, name="")


def call_model(state: Dict[str, List[BaseMessage]]) -> Dict[str, List[BaseMessage]]:
    msgs: List[BaseMessage] = state["messages"]
    reply = llm.invoke(msgs)
    return {"messages": msgs + [reply]}


def should_continue(_state):
    return END


checkpointer = InMemorySaver()


def build_graph():
    g = StateGraph(dict)
    g.add_node("agent", call_model)
    g.add_edge(START, "agent")
    g.add_conditional_edges("agent", should_continue)
    return g.compile(checkpointer=checkpointer)

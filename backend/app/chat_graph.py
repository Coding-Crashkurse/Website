import os
from typing import Dict, List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

llm = ChatOpenAI(temperature=0)



def call_model(state: Dict[str, List[BaseMessage]]) -> Dict[str, List[BaseMessage]]:
    msgs: List[BaseMessage] = state["messages"]
    reply = llm.invoke(msgs)
    return {"messages": msgs + [reply]}


def should_continue(_state):
    return END

saver = PostgresSaver.from_conn_string(os.getenv("DATABASE_URL"))


def build_graph():
    g = StateGraph(dict)
    g.add_node("agent", call_model)
    g.add_edge(START, "agent")
    g.add_conditional_edges("agent", should_continue)
    return g.compile(checkpointer=saver)


_GRAPHS: Dict[str, any] = {}


def get_graph(thread_id: str):
    if thread_id not in _GRAPHS:
        _GRAPHS[thread_id] = build_graph()
    return _GRAPHS[thread_id]

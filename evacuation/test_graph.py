from .graph_loader import load_or_create_graph
from .evacuation_router import (
    find_shortest_path_nodes,
    find_safe_path_nodes,
    path_length,
)
from .intruder_input import load_intruder_from_json
from .visualize_graph import visualize_graph_with_paths

import networkx as nx
import os

print("=== TEST STARTED ===")

# Load graph
G = load_or_create_graph()
print("Graph loaded with", len(G.nodes), "nodes")

# Use largest weakly connected component
largest_cc = max(nx.weakly_connected_components(G), key=len)
H = G.subgraph(largest_cc)

nodes = list(H.nodes)
start_node = nodes[0]

# Pick a far-away end node using x/y coordinates
sx = H.nodes[start_node].get("x")
sy = H.nodes[start_node].get("y")
if sx is None or sy is None:
    raise RuntimeError("Graph nodes are missing x/y attributes")

end_node = max(
    nodes[1:],
    key=lambda n: (H.nodes[n]["x"] - sx) ** 2 + (H.nodes[n]["y"] - sy) ** 2,
)

print("Calling A* function...")
print("Start node:", start_node)
print("End node:", end_node)

try:
    # 1) Baseline shortest path
    path = find_shortest_path_nodes(G, start_node, end_node)
    print("A* path returned")
    print("Path length (nodes):", len(path))
    print("Path length (meters):", round(path_length(G, path), 2))

    # 2) Load intruder strictly from JSON
    intruders = []
    intruder_json = os.path.join("data", "intruder.json")

    if not os.path.exists(intruder_json):
        raise FileNotFoundError("intruder.json not found in data/ folder")

    intruder = load_intruder_from_json(intruder_json, G)
    intruders.append(intruder)
    print("Loaded intruder from JSON:", intruder["intruder_id"])

    # 3) Compute safe path
    print("Trying safe route to original destination...")
    try:
        safe_path = find_safe_path_nodes(G, start_node, end_node, intruders)
        print("Safe path returned")
        print("Safe path length (nodes):", len(safe_path))
        print("Safe path length (meters):", round(path_length(G, safe_path), 2))
        print("Intruder node in safe path?:", intruder["node"] in set(safe_path))
    except nx.NetworkXNoPath:
        print("No safe path to the original destination.")
        safe_path = None

except Exception as e:
    print("Error:", repr(e))
    path = None
    safe_path = None
    intruders = []

# 4) Visualization
if path:
    visualize_graph_with_paths(
        G,
        original_path=path,
        safe_path=safe_path,
        intruder_node=intruders[0]["node"] if intruders else None,
    )




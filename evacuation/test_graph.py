from .graph_loader import load_or_create_graph
from .evacuation_router import find_shortest_path_nodes, path_length
import networkx as nx

print("=== TEST STARTED ===")

# Load graph
G = load_or_create_graph()
print("Graph loaded with", len(G.nodes), "nodes")

# Pick two nodes that are connected and far apart (avoid start_node == end_node)
# For directed graphs, use weak connectivity for "there exists some route" logic.
largest_cc = max(nx.weakly_connected_components(G), key=len)
H = G.subgraph(largest_cc)

nodes = list(H.nodes)
start_node = nodes[0]

# Use projected x/y (meters) to pick a far-away end node
sx = H.nodes[start_node].get("x")
sy = H.nodes[start_node].get("y")
if sx is None or sy is None:
    raise RuntimeError("Graph nodes are missing x/y attributes; is the graph projected?")

end_node = max(
    nodes[1:],
    key=lambda n: (H.nodes[n]["x"] - sx) ** 2 + (H.nodes[n]["y"] - sy) ** 2,
)

print("Calling A* function...")
print("Start node:", start_node)
print("End node:", end_node)

try:
    path = find_shortest_path_nodes(G, start_node, end_node)
    print("A* path returned")
    print("Path length (nodes):", len(path))
    print("Path length (meters):", round(path_length(G, path), 2))
    print("First node:", path[0])
    print("Last node:", path[-1])
except Exception as e:
    print("A* raised an exception:", repr(e))

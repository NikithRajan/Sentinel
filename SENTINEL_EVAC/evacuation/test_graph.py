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
G = G.subgraph(largest_cc).copy()

intruder_json = os.path.join("data", "intruder.json")
if not os.path.exists(intruder_json):
    raise FileNotFoundError("intruder.json not found in data/ folder")

intruder = load_intruder_from_json(intruder_json, G)
start_node = intruder["person_node"]
intruder_node = intruder["intruder_node"]
safe_zones = intruder.get("safe_zones", [])

print("Start node (person):", start_node)
print("Intruder node:", intruder_node)
print("Safe zones:", safe_zones)

# Choose destination as farthest node from start
nodes = list(G.nodes)
sx = G.nodes[start_node]["x"]
sy = G.nodes[start_node]["y"]
end_node = max(
    (n for n in nodes if n != start_node),
    key=lambda n: (G.nodes[n]["x"] - sx) ** 2 + (G.nodes[n]["y"] - sy) ** 2,
)
print("End node (destination):", end_node)

try:
    original_path = find_shortest_path_nodes(G, start_node, end_node)
    print("Original evacuation path length (nodes):", len(original_path))
    print("Original evacuation path length (meters):", round(path_length(G, original_path), 2))

    intruders = [{
        "node": intruder_node,
        "radius_meters": intruder["radius_meters"],
    }]

    safe_path = None
    reroute_reason = "none"

    # If we have safe zones, route to nearest reachable safe zone first.
    if safe_zones:
        print("Computing nearest safe zone route...")
        best_path = None
        best_len = float("inf")
        best_zone = None
        for zone_node in safe_zones:
            if zone_node not in G:
                continue
            try:
                zone_path = find_safe_path_nodes(G, start_node, zone_node, intruders)
                dist = path_length(G, zone_path)
                if dist < best_len:
                    best_len = dist
                    best_path = zone_path
                    best_zone = zone_node
            except nx.NetworkXNoPath:
                continue
        if best_path is not None:
            safe_path = best_path
            reroute_reason = f"safe_zone_{best_zone}"
            print("Routed to safe zone node:", best_zone)
            print("Safe zone path length (meters):", round(best_len, 2))

    # If no safe zone route found, or no safe zone configured, route to destination avoiding intruder.
    if safe_path is None:
        print("No safe zone path available; computing destination route avoiding intruder.")
        try:
            safe_path = find_safe_path_nodes(G, start_node, end_node, intruders)
            reroute_reason = "destination_avoid_intruder"
            print("Safe destination path length (meters):", round(path_length(G, safe_path), 2))
        except nx.NetworkXNoPath:
            print("Could not compute a safe path to destination.")
            safe_path = None

    print("Reroute reason:", reroute_reason)

except Exception as e:
    print("Error:", repr(e))
    original_path = None
    safe_path = None
    intruders = []

# Visualize both paths
if original_path:
    visualize_graph_with_paths(
        G,
        original_path=original_path,
        safe_path=safe_path,
        intruder_node=intruder_node,
        safe_zone_nodes=safe_zones,
    )

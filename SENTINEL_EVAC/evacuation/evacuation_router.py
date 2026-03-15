import networkx as nx
import osmnx as ox

__all__ = [
    "find_shortest_path",
    "find_shortest_path_nodes",
    "find_safe_path_nodes",
    "path_length",
]

# ---------------------------------------------------
# Coordinate-based routing (keep this)
# ---------------------------------------------------

def find_shortest_path(G, start_point, end_point):
    """
    Compute the shortest evacuation path between two (lat, lon) points using A*.
    """

    start_node = ox.nearest_nodes(G, start_point[1], start_point[0])
    end_node   = ox.nearest_nodes(G, end_point[1], end_point[0])

    print("Start node:", start_node)
    print("End node:", end_node)

    return nx.astar_path(G, start_node, end_node, weight="length")


# ---------------------------------------------------
# Node-based routing (THIS FIXES YOUR TEST)
# ---------------------------------------------------

def find_shortest_path_nodes(G, start_node, end_node):
    """
    Compute shortest evacuation path between two graph nodes using A*.
    """

    print("Start node:", start_node)
    print("End node:", end_node)

    return nx.astar_path(G, start_node, end_node, weight="length")


def find_safe_path_nodes(G, start_node, end_node, intruders):
    """
    Find a shortest path that avoids intruder zones.

    Parameters
    ----------
    G : networkx.MultiDiGraph
        Projected graph (nodes must have x/y in meters).
    start_node, end_node : int
        Node IDs in G.
    intruders : list[dict]
        Each dict should have:
          - "node": intruder node id in G
          - "radius_meters": exclusion radius around intruder

    Returns
    -------
    list[int]
        A* path avoiding excluded nodes.
    """
    if not intruders:
        return find_shortest_path_nodes(G, start_node, end_node)

    # Defensive: ensure projected x/y exist
    sample = next(iter(G.nodes))
    if "x" not in G.nodes[sample] or "y" not in G.nodes[sample]:
        raise RuntimeError("Graph nodes missing x/y. Project the graph before safe routing.")

    # Build a "risk-aware" graph:
    # - Hard-block the intruder's exact node (no contact).
    # - Soft-avoid the surrounding radius by adding a large cost penalty.
    H = G.copy()

    # Build danger zone nodes within radius (meters)
    danger_nodes = set()
    for intr in intruders:
        intr_node = intr.get("node")
        r = float(intr.get("radius_meters", 0))
        if intr_node not in G or r <= 0:
            continue
        # Always include the intruder node itself as danger
        danger_nodes.add(intr_node)

        ix = G.nodes[intr_node]["x"]
        iy = G.nodes[intr_node]["y"]
        r2 = r * r
        for n, data in G.nodes(data=True):
            dx = data["x"] - ix
            dy = data["y"] - iy
            if (dx * dx + dy * dy) <= r2:
                danger_nodes.add(n)

    danger_nodes.discard(start_node)
    danger_nodes.discard(end_node)

    # Add penalty to edges touching danger nodes
    penalty = 1_000_000.0
    for u, v, k, data in H.edges(keys=True, data=True):
        base = float(data.get("length", 1.0))
        data["risk_length"] = base + (penalty if (u in danger_nodes or v in danger_nodes) else 0.0)

    # Compute a risk-aware path first
    risk_path = nx.astar_path(H, start_node, end_node, weight="risk_length")

    # If the risk path still passes through intruder nodes, and we can hard-block intruder nodes, try that route
    intruder_nodes = {intr.get("node") for intr in intruders if intr.get("node") in G}
    intruder_nodes.discard(start_node)
    intruder_nodes.discard(end_node)
    if any(node in intruder_nodes for node in risk_path):
        H2 = G.copy()
        H2.remove_nodes_from(intruder_nodes)
        try:
            return nx.astar_path(H2, start_node, end_node, weight="length")
        except nx.NetworkXNoPath:
            pass

    return risk_path


# ---------------------------------------------------
# Path length utility
# ---------------------------------------------------

def path_length(G, path):
    """
    Compute total path length in meters.
    """

    length = 0.0
    for u, v in zip(path[:-1], path[1:]):
        edge_data = min(
            G.get_edge_data(u, v).values(),
            key=lambda x: x["length"]
        )
        length += edge_data["length"]

    return length

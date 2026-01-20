import networkx as nx
import osmnx as ox

__all__ = [
    "find_shortest_path",
    "find_shortest_path_nodes",
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

import os
import osmnx as ox


def load_or_create_graph(
    center_point=(10.1556, 76.3913),  # Kochi International Airport
    dist=2500,                        # radius in meters
    graph_path="data/airport.graphml"

):
    """
    Load a cached campus graph or download it, then project to a metric CRS.

    The returned graph is always projected, so nearest-node queries and
    pathfinding do not require scikit-learn.
    """
    if os.path.exists(graph_path):
        print("Loading offline graph...")
        G = ox.load_graphml(graph_path)
    else:
        print("Downloading map data using coordinates...")
        G = ox.graph_from_point(
            center_point,
            dist=dist,
            network_type="walk"
        )
        ox.save_graphml(G, graph_path)

    # Ensure the graph is projected (meters) for routing and nearest_nodes
    if G.graph.get("crs") == "epsg:4326":
        G = ox.project_graph(G)

    return G

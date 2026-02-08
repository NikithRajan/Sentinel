from evacuation.graph_loader import load_or_create_graph
import os
import osmnx as ox
import matplotlib.pyplot as plt


def visualize_graph_with_paths(G, original_path=None, safe_path=None, intruder_node=None):
    """
    Visualize graph, evacuation paths, and intruder location.
    """

    print(f"Loaded graph with {len(G.nodes)} nodes and {len(G.edges)} edges")

    # Base graph
    fig, ax = ox.plot_graph(
        G,
        node_size=0,
        edge_linewidth=0.5,
        edge_color="#BBBBBB",
        bgcolor="white",
        show=False,
        close=False,
        figsize=(12, 12)
    )

    # Plot original evacuation path
    if original_path:
        ox.plot_graph_route(
            G,
            original_path,
            route_color="green",
            route_linewidth=3,
            ax=ax,
            orig_dest_size=60,
            show=False,
            close=False
        )

    # Plot safe path (if different)
    if safe_path and safe_path != original_path:
        ox.plot_graph_route(
            G,
            safe_path,
            route_color="orange",
            route_linewidth=3,
            ax=ax,
            orig_dest_size=60,
            show=False,
            close=False
        )

    # Plot intruder
    if intruder_node:
        x = G.nodes[intruder_node]["x"]
        y = G.nodes[intruder_node]["y"]
        ax.scatter(
            x, y,
            c="red",
            s=150,
            marker="X",
            label="Intruder"
        )

    ax.legend()
    plt.title("Evacuation Route Visualization")

    # Save figure
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(project_root, "data", "evacuation_visualization.png")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"\nVisualization saved to: {output_path}")

    plt.show()
    print("\nVisualization displayed!")

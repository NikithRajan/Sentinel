from evacuation.graph_loader import load_or_create_graph
import os
import osmnx as ox
import matplotlib.pyplot as plt


def visualize_graph_with_paths(
    G,
    original_path=None,
    safe_path=None,
    intruder_node=None,
    person_node=None,
    camera_node=None,
    safe_zone_nodes=None,
):
    """
    Visualize graph, evacuation paths, intruder location, person location, camera location, and safe zones.
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

    # Plot original evacuation path (previous route)
    if original_path:
        ox.plot_graph_route(
            G,
            original_path,
            route_color="orange",
            route_linewidth=3,
            ax=ax,
            orig_dest_size=60,
            show=False,
            close=False
        )

    # Plot safe path (present route) if intruder causes reroute
    if safe_path:
        route_color = "green" if safe_path != original_path else "orange"
        ox.plot_graph_route(
            G,
            safe_path,
            route_color=route_color,
            route_linewidth=3,
            ax=ax,
            orig_dest_size=60,
            show=False,
            close=False
        )

    # Plot intruder
    if intruder_node and intruder_node in G:
        x = G.nodes[intruder_node]["x"]
        y = G.nodes[intruder_node]["y"]
        ax.scatter(
            x, y,
            c="red",
            s=250,
            marker="X",
            label="Intruder",
            zorder=10
        )

    # Plot person
    if person_node and person_node in G:
        px = G.nodes[person_node]["x"]
        py = G.nodes[person_node]["y"]
        ax.scatter(
            px, py,
            c="blue",
            s=200,
            marker="P",
            label="Person",
            zorder=9
        )

    # Plot safe zone nodes
    if safe_zone_nodes:
        zs = [n for n in safe_zone_nodes if n in G]
        if zs:
            xs = [G.nodes[n]["x"] for n in zs]
            ys = [G.nodes[n]["y"] for n in zs]
            ax.scatter(
                xs,
                ys,
                c="purple",
                s=100,
                marker="o",
                label="Safe Zones",
                edgecolors="k",
                zorder=5
            )

    # Plot camera
    if camera_node and camera_node in G:
        cx = G.nodes[camera_node]["x"]
        cy = G.nodes[camera_node]["y"]
        ax.scatter(
            cx, cy,
            c="orange",
            s=150,
            marker="s",
            label="Camera",
            zorder=6
        )

    ax.legend()
    plt.title("Evacuation Route Visualization")

    # Save figure
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(project_root, "data", "evacuation_visualization.png")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"\nVisualization saved to: {output_path}")

    # Remove blocking plt.show() to prevent the subprocess from hanging infinitely in production!
    # plt.show()
    # print("\nVisualization displayed!")

from evacuation.graph_loader import load_or_create_graph
import os
import osmnx as ox
import matplotlib.pyplot as plt

# Load the graph
G = load_or_create_graph()

print(f"Loaded graph with {len(G.nodes)} nodes and {len(G.edges)} edges")

# Visualize the graph
# This will open a matplotlib window showing the airport map
fig, ax = ox.plot_graph(
    G,
    node_size=0,  # Hide nodes for cleaner view
    edge_linewidth=0.5,
    edge_color='#333333',
    bgcolor='white',
    show=False,  # Don't auto-display (we'll control it)
    close=False,  # Keep the figure open
    figsize=(12, 12)
)

# Save the visualization to a file (path relative to project root, not CWD)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
output_path = os.path.join(project_root, "data", "airport_map.png")
plt.savefig(output_path, dpi=150, bbox_inches='tight')
print(f"\nMap saved to: {output_path}")

# Display the plot
plt.show()

print("\nGraph visualization displayed!")
print("Close the matplotlib window when done viewing.")

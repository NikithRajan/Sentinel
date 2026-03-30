import networkx as nx
from evacuation.graph_loader import load_or_create_graph
import math

G = load_or_create_graph()
# use largest cc
largest_cc = max(nx.weakly_connected_components(G), key=len)
G = G.subgraph(largest_cc).copy()

person_node = 18306177
intruder_node = 5973761733

nodes = list(G.nodes(data=True))

# Find 3 safe zones:
# 1. Very close to person
# 2. Medium distance
# 3. Far distance
def dist(n1, n2):
    return (G.nodes[n1]['x'] - G.nodes[n2]['x'])**2 + (G.nodes[n1]['y'] - G.nodes[n2]['y'])**2

nodes.sort(key=lambda x: dist(person_node, x[0]))
# pick nodes at different intervals that are NOT the person or intruder
safe1 = nodes[50][0] 
safe2 = nodes[200][0]
safe3 = list(reversed(nodes))[0][0]

print("Person:", person_node)
print("Safe1:", safe1)
print("Safe2:", safe2)
print("Safe3:", safe3)

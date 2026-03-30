import math

def get_turn_direction(x1, y1, x2, y2, x3, y3):
    """
    Determine the relative turn direction (straight, left, right, down) 
    given three points (two segments: p1->p2 and p2->p3).
    """
    angle1 = math.atan2(y2 - y1, x2 - x1)
    angle2 = math.atan2(y3 - y2, x3 - x2)
    
    diff = math.degrees(angle2 - angle1)
    diff = (diff + 180) % 360 - 180
    
    if -45 <= diff <= 45:
        return "straight"
    elif 45 < diff < 135:
        return "left"
    elif -135 < diff < -45:
        return "right"
    else:
        return "down"

def generate_directions(G, path):
    """
    Generate step-by-step generic text directions for a path.
    """
    if not path or len(path) < 2:
        return ["You have arrived."]
        
    directions = []
    
    # Distances
    def dist(u, v):
        edge_data = G.get_edge_data(u, v)
        if not edge_data:
            return 0
        min_key = min(edge_data.keys(), key=lambda k: edge_data[k].get('length', float('inf')))
        return edge_data[min_key].get('length', 0)

    # Initial Segment
    u = path[0]
    v = path[1]
    seg_length = dist(u, v)
    
    for i in range(1, len(path) - 1):
        x1, y1 = G.nodes[path[i-1]]['x'], G.nodes[path[i-1]]['y']
        x2, y2 = G.nodes[path[i]]['x'], G.nodes[path[i]]['y']
        x3, y3 = G.nodes[path[i+1]]['x'], G.nodes[path[i+1]]['y']
        
        turn = get_turn_direction(x1, y1, x2, y2, x3, y3)
        
        if turn == "straight":
            # Just accumulate distance
            seg_length += dist(path[i], path[i+1])
        else:
            directions.append(f"Go straight for {round(seg_length, 1)} meters, then turn {turn}.")
            seg_length = dist(path[i], path[i+1])
            
    # Final leg
    if seg_length > 0:
        directions.append(f"Go straight for {round(seg_length, 1)} meters to reach the safe zone.")
        
    return directions

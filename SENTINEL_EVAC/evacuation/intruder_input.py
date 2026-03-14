import json
import osmnx as ox


def load_intruder_from_json(json_path, G):
    """
    Load intruder data from JSON and map it to a graph node.

    Expected JSON format (either):
    {
      "intruder_id": "I1",
      "node": 2446825571,
      "radius_meters": 150,
      "timestamp": "2026-01-20T12:00:00Z",
      "threat_level": "high"
    }
    OR
    {
      "intruder_id": "I1",
      "location": {"lat": 10.1560, "lon": 76.3920},
      "radius_meters": 150,
      "timestamp": "2026-01-20T12:00:00Z",
      "threat_level": "high"
    }
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # If JSON already has a node field, use it directly
    if "node" in data:
        intruder_node = data["node"]
    # Otherwise, compute the nearest node from lat/lon
    elif "location" in data:
        lat = data["location"]["lat"]
        lon = data["location"]["lon"]
        intruder_node = ox.nearest_nodes(G, lon, lat)
    else:
        raise ValueError("JSON must contain either 'node' or 'location' field")

    radius = data.get("radius_meters", 100)

    return {
        "intruder_id": data["intruder_id"],
        "node": intruder_node,
        "radius_meters": radius,
        "threat_level": data.get("threat_level", "unknown"),
        "timestamp": data.get("timestamp"),
    }

    lat = data["location"]["lat"]
    lon = data["location"]["lon"]
    radius = data.get("radius_meters", 100)

    intruder_node = ox.nearest_nodes(G, lon, lat)

    return {
        "intruder_id": data["intruder_id"],
        "node": intruder_node,
        "radius_meters": radius,
        "threat_level": data.get("threat_level", "unknown"),
        "timestamp": data["timestamp"]
    }

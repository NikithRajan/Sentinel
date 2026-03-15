import json
import osmnx as ox


def load_intruder_from_json(json_path, G):
    """
    Load intruder and evacuation metadata from JSON and map to graph nodes.

    Expected JSON format:
    {
      "intruder_id": "I1",
      "intruder_location": {"lat": 10.1560, "lon": 76.3920},
      "radius_meters": 150,
      "person_location": {"lat": 10.1538, "lon": 76.3915},
      "safe_zones": [
        {"lat": 10.1540, "lon": 76.3908},
        {"lat": 10.1546, "lon": 76.3922}
      ],
      "timestamp": "2026-01-20T12:00:00Z",
      "threat_level": "high"
    }
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "intruder_node" in data:
        intruder_node = data["intruder_node"]
    elif "intruder_location" in data:
        lat = data["intruder_location"]["lat"]
        lon = data["intruder_location"]["lon"]
        intruder_node = ox.nearest_nodes(G, lon, lat)
    else:
        raise ValueError("JSON must contain 'intruder_node' or 'intruder_location'")

    if "person_node" in data:
        person_node = data["person_node"]
    elif "person_location" in data:
        lat = data["person_location"]["lat"]
        lon = data["person_location"]["lon"]
        person_node = ox.nearest_nodes(G, lon, lat)
    else:
        raise ValueError("JSON must contain 'person_node' or 'person_location'")

    radius = data.get("radius_meters", 100)

    safe_zones = []
    for zone in data.get("safe_zones", []):
        if isinstance(zone, dict) and "node" in zone:
            safe_zones.append(zone["node"])
        elif isinstance(zone, dict) and "location" in zone:
            lat = zone["location"]["lat"]
            lon = zone["location"]["lon"]
            safe_zone_node = ox.nearest_nodes(G, lon, lat)
            safe_zones.append(safe_zone_node)
        elif isinstance(zone, dict) and "lat" in zone and "lon" in zone:
            safe_zone_node = ox.nearest_nodes(G, zone["lon"], zone["lat"])
            safe_zones.append(safe_zone_node)
        elif isinstance(zone, int):
            safe_zones.append(zone)

    return {
        "intruder_id": data.get("intruder_id", "intruder"),
        "intruder_node": intruder_node,
        "person_node": person_node,
        "radius_meters": radius,
        "safe_zones": safe_zones,
        "threat_level": data.get("threat_level", "unknown"),
        "timestamp": data.get("timestamp"),
    }

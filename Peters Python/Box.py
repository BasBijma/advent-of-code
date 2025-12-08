class Box:
    def __init__(self, box_id, coords) -> None:
        self.id = box_id
        self.coords = coords
        self.distances = []
        self.nearest_distance = 0
        self.connected_to = [self]

    def set_distances(self, boxes):
        for box in boxes[self.id:]:
            if box.id == self.id:
                continue
            distance = self.get_distance(box)
            # print("asdsa", distance)
            self.distances.append((box, distance))
            box.add_distance(self, distance)
    
    def add_distance(self, other, distance):
        self.distances.append((other, distance))
    
    def get_distance(self, other):
        return sum((self.coords[i] - other.coords[i]) * (self.coords[i] - other.coords[i]) for i in range(3))

    def sort_distances(self):
        self.distances = sorted(self.distances, key=lambda x: x[1])

    def connect_to_nearest(self):
        nearest = self.distances[0][0]
        self.connect_to(nearest)
        nearest.connect_to(self)
        return (self, nearest)
            
    def connect_to(self, other):
        # Merge connected_to sets without recursion
        all_connected = set(self.connected_to) | set(other.connected_to)
        
        # Update all boxes in the merged group to have the same connected_to list
        for box in all_connected:
            box.connected_to = list(all_connected)

        self.distances = self.distances[1:]
